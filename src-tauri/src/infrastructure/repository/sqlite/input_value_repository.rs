use std::sync::{Arc, Mutex};

use rusqlite::{params, Connection};

use crate::domain::{
    entities::input_value::InputValue, error::DomainError, repository::InputValueRepository,
};

pub struct SqliteInputValueRepository {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteInputValueRepository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn: conn }
    }
}

impl InputValueRepository for SqliteInputValueRepository {
    fn create(&self, model: &InputValue) -> Result<i64, DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let transaction = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let number_of_input_values: i64 = transaction
            .query_row(
                "SELECT COUNT(*) FROM input_value WHERE input_parameter_id = ?",
                params![&model.input_parameter_id],
                |row| row.get(0),
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let a: f32;
        let b: f32;
        let c: f32;
        let d: f32;

        let (input_parameter_start, input_parameter_end): (f32, f32) = transaction
            .query_row(
                "SELECT start, end FROM input_parameter WHERE id = ?",
                params![model.input_parameter_id],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        if number_of_input_values > 0 {
            // Get the last term (rightmost) to split it
            let (prev_id, prev_a, prev_b, _prev_c, prev_d): (i64, f32, f32, f32, f32) = transaction
                .query_row(
                    "SELECT id, a, b, c, d FROM input_value WHERE input_parameter_id = ? ORDER BY d DESC LIMIT 1",
                    params![model.input_parameter_id],
                    |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            // Split the rightmost term into two overlapping terms following Ruspini partition rules
            // For overlapping terms: prev.c = next.a, prev.d = next.b
            // Constraint: a < b <= c < d
            
            let epsilon = (input_parameter_end - input_parameter_start) * 0.001;
            let is_last_term = (prev_d - input_parameter_end).abs() < epsilon * 2.0;
            
            if is_last_term {
                // Last term spans to end, split it in middle
                // Old term will be first half, new term will be second half
                let range = prev_d - prev_b; // total range from plateau start to end
                let mid = prev_b + range / 2.0;
                let overlap = range / 4.0; // overlap width
                
                // Update previous (now first) term: keep a,b same, but shorten right side
                let new_prev_c = mid - overlap;
                let new_prev_d = mid + overlap;
                
                transaction
                    .execute(
                        "UPDATE input_value SET c = ?, d = ? WHERE id = ?",
                        params![new_prev_c, new_prev_d, prev_id],
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                
                // New (last) term: overlaps with previous, extends to end
                a = new_prev_c;  // = prev.c (overlap constraint)
                b = new_prev_d;  // = prev.d (overlap constraint)
                c = input_parameter_end;
                d = input_parameter_end + epsilon;
            } else {
                // Not last term, just split it in middle
                let mid = (prev_a + prev_d) / 2.0;
                let quarter = (prev_d - prev_a) / 4.0;
                
                // Update previous term: keep left side, shorten right
                let new_prev_c = mid - quarter;
                let new_prev_d = mid + quarter;
                
                transaction
                    .execute(
                        "UPDATE input_value SET c = ?, d = ? WHERE id = ?",
                        params![new_prev_c, new_prev_d, prev_id],
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                
                // New term: overlaps with previous
                a = new_prev_c;
                b = new_prev_d;
                c = prev_d - quarter;
                d = prev_d;
            }
        } else {
            // First term: covers entire range
            let epsilon = (input_parameter_end - input_parameter_start) * 0.001;
            a = input_parameter_start - epsilon;
            b = input_parameter_start;
            c = input_parameter_end;
            d = input_parameter_end + epsilon;
        }

        let result = {
            let mut stmt = transaction
                .prepare("INSERT INTO input_value (input_parameter_id, value, a, b, c, d) VALUES (?, ?, ?, ?, ?, ?)").map_err(|e| DomainError::Internal(e.to_string()))?;
            stmt.execute(rusqlite::params![
                &model.input_parameter_id,
                &model.value,
                &a,
                &b,
                &c,
                &d
            ])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

            let new_input_value_id = transaction.last_insert_rowid();

            let problem_id: i64 = transaction
                .query_row(
                    "SELECT problem_id FROM input_parameter WHERE id = ?",
                    params![&model.input_parameter_id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let mut stmt = transaction.prepare("SELECT output_value.id, output_value.input_value_ids, output_value.output_parameter_id FROM output_value LEFT JOIN output_parameter ON output_value.output_parameter_id = output_parameter.id WHERE output_parameter.problem_id = ?") .map_err(|e| DomainError::Internal(e.to_string()))?;
            let mut output_values_rows = stmt
                .query(rusqlite::params![&problem_id])
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let mut output_values = Vec::<(i64, String, i64)>::new();
            while let Some(row) = output_values_rows
                .next()
                .map_err(|e| DomainError::Internal(e.to_string()))?
            {
                output_values.push((
                    row.get(0)
                        .map_err(|e| DomainError::Internal(e.to_string()))?,
                    row.get(1)
                        .map_err(|e| DomainError::Internal(e.to_string()))?,
                    row.get(2)
                        .map_err(|e| DomainError::Internal(e.to_string()))?,
                ));
            }

            if output_values.len() == 0 {
                let mut stmt = transaction
                    .prepare("SELECT id FROM output_parameter WHERE problem_id = ?")
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                let mut output_parameter_id_rows = stmt
                    .query(rusqlite::params![&problem_id])
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                let mut output_parameter_ids = Vec::<i64>::new();
                while let Some(row) = output_parameter_id_rows
                    .next()
                    .map_err(|e| DomainError::Internal(e.to_string()))?
                {
                    output_parameter_ids.push(
                        row.get(0)
                            .map_err(|e| DomainError::Internal(e.to_string()))?,
                    );
                }

                for output_parameter_id in output_parameter_ids {
                    let mut stmt = transaction.prepare("INSERT INTO output_value (output_parameter_id, input_value_ids) VALUES (?, ?)") .map_err(|e| DomainError::Internal(e.to_string()))?;
                    stmt.execute(params![
                        &output_parameter_id,
                        format!("|{}|", &new_input_value_id)
                    ])
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                }
            } else {
                if number_of_input_values == 0 {
                    let mut stmt: rusqlite::Statement<'_> = transaction
                        .prepare("UPDATE output_value SET input_value_ids = ? WHERE id = ?")
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                    for (output_value_id, input_value_ids, _) in output_values {
                        let mut input_value_ids: Vec<i64> = input_value_ids
                            .split('|')
                            .filter(|s| !s.is_empty())
                            .map(|s| s.parse::<i64>().unwrap())
                            .collect();
                        input_value_ids.push(new_input_value_id);
                        input_value_ids.sort();
                        let input_value_ids = input_value_ids
                            .iter()
                            .map(|n| n.to_string())
                            .collect::<Vec<String>>()
                            .join("||");
                        stmt.execute(params![format!("|{input_value_ids}|"), &output_value_id])
                            .map_err(|e| DomainError::Internal(e.to_string()))?;
                    }
                } else {
                    let input_value_id_to_replace: i64 =  transaction.query_row("SELECT input_value.id FROM input_value LEFT JOIN input_parameter ON input_value.input_parameter_id = input_parameter.id WHERE input_parameter.problem_id = ?  AND  input_value.id != ? AND input_parameter.id == ? LIMIT 1", params![&problem_id, &new_input_value_id,  &model.input_parameter_id], |row| row.get(0)) .map_err(|e| DomainError::Internal(e.to_string()))?;

                    for (_, input_value_ids, output_parameter_id) in output_values {
                        if !input_value_ids
                            .contains(format!("|{}|", &input_value_id_to_replace).as_str())
                        {
                            continue;
                        }
                        let input_value_ids = input_value_ids.replace(
                            format!("|{}|", &input_value_id_to_replace).as_str(),
                            format!("|{}|", &new_input_value_id).as_str(),
                        );
                        let mut input_value_ids: Vec<i64> = input_value_ids
                            .split('|')
                            .filter(|s| !s.is_empty())
                            .map(|s| s.parse::<i64>().unwrap())
                            .collect();
                        input_value_ids.sort();
                        let input_value_ids = input_value_ids
                            .iter()
                            .map(|n| n.to_string())
                            .collect::<Vec<String>>()
                            .join("||");
                        let mut stmt = transaction.prepare("INSERT INTO output_value (output_parameter_id, input_value_ids) VALUES (?, ?)") .map_err(|e| DomainError::Internal(e.to_string()))?;
                        stmt.execute(params![
                            &output_parameter_id,
                            format!("|{input_value_ids}|")
                        ])
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                    }
                }
            }
            Ok(new_input_value_id)
        };

        match result {
            Ok(id) => {
                transaction
                    .commit()
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                Ok(id)
            }
            Err(e) => {
                transaction
                    .rollback()
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                Err(e)
            }
        }
    }

    fn remove_by_id(&self, id: i64) -> Result<(), DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let transaction = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let result: Result<(), DomainError> = {
            let input_parameter_id: i64 = transaction
                .query_row(
                    "SELECT input_parameter_id FROM input_value WHERE id = ? LIMIT 1",
                    params![&id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let input_values_number: i64 = transaction
                .query_row(
                    "SELECT COUNT(*) FROM input_value WHERE input_value.input_parameter_id = ?",
                    params![&input_parameter_id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            if input_values_number > 1 {
                let (a, b, c, d): (f32, f32, f32, f32) = transaction
                    .query_row(
                        "SELECT a, b, c, d FROM input_value WHERE id = ?",
                        params![id],
                        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;

                let prev_result: Result<(i64, f32, f32, f32, f32), rusqlite::Error> = transaction
                    .query_row(
                    "SELECT id, a, b, c, d FROM input_value WHERE input_parameter_id = ? AND a < ? ORDER BY a DESC LIMIT 1",
                    params![input_parameter_id, a],
                    |row| {
                        Ok((
                            row.get(0)?,
                            row.get(1)?,
                            row.get(2)?,
                            row.get(3)?,
                            row.get(4)?,
                        ))
                    },
                );

                let next_result: Result<(i64, f32, f32, f32, f32), rusqlite::Error> = transaction
                    .query_row(
                        "SELECT id, a, b, c, d FROM input_value WHERE input_parameter_id = ? AND a > ? ORDER BY a ASC LIMIT 1",
                        params![input_parameter_id, a],
                        |row| {
                            Ok((
                                row.get(0)?,
                                row.get(1)?,
                                row.get(2)?,
                                row.get(3)?,
                                row.get(4)?,
                            ))
                        },
                    );

                match (prev_result, next_result) {
                    (Ok(prev), Ok(next)) => {
                        let mid = a + (d - a) / 2.0;
                        let pivot = (d - a) / 4.0;

                        let prev_c = mid - pivot;
                        let prev_d = mid + pivot;

                        transaction
                            .execute(
                                "UPDATE input_value SET c = ?, d = ? WHERE id = ?",
                                params![prev_c, prev_d, prev.0],
                            )
                            .map_err(|e| DomainError::Internal(e.to_string()))?;

                        let next_a = prev_c;
                        let next_b = prev_d;

                        transaction
                            .execute(
                                "UPDATE input_value SET a = ?, b = ? WHERE id = ?",
                                params![next_a, next_b, next.0],
                            )
                            .map_err(|e| DomainError::Internal(e.to_string()))?;
                    }
                    (Ok(prev), Err(rusqlite::Error::QueryReturnedNoRows)) => {
                        // No next element - we're deleting the last one, extend prev to end
                        transaction
                            .execute(
                                "UPDATE input_value SET c = ?, d = ? WHERE id = ?",
                                params![c, d, prev.0],
                            )
                            .map_err(|e| DomainError::Internal(e.to_string()))?;
                    }
                    (Ok(_prev), Err(e)) => {
                        return Err(DomainError::Data(e.to_string()));
                    }
                    (Err(rusqlite::Error::QueryReturnedNoRows), Ok(next)) => {
                        // No prev element - we're deleting the first one, extend next to start
                        transaction
                            .execute(
                                "UPDATE input_value SET a = ?, b = ? WHERE id = ?",
                                params![a, b, next.0],
                            )
                            .map_err(|e| DomainError::Internal(e.to_string()))?;
                    }
                    (Err(e), Ok(_next)) => {
                        return Err(DomainError::Data(e.to_string()));
                    }
                    (Err(rusqlite::Error::QueryReturnedNoRows), Err(rusqlite::Error::QueryReturnedNoRows)) => {
                        // Single element being deleted - nothing to adjust
                    }
                    (Err(prev_e), Err(_next_e)) => {
                        // Check if prev_e is QueryReturnedNoRows
                        if !matches!(prev_e, rusqlite::Error::QueryReturnedNoRows) {
                            return Err(DomainError::Data(prev_e.to_string()));
                        }
                        // next_e is a real error
                        return Err(DomainError::Data(_next_e.to_string()));
                    }
                }

                transaction
                    .execute(
                        format!(
                            "DELETE FROM output_value WHERE input_value_ids LIKE '%|{}|%'",
                            id
                        )
                        .as_str(),
                        params![],
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
            } else {
                let problem_id: i64 = transaction
                    .query_row(
                        "SELECT problem_id FROM input_parameter WHERE id = ?",
                        params![&input_parameter_id],
                        |row| row.get(0),
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;

                let total_input_values_number: i64 = transaction.query_row(
                "SELECT COUNT(*) FROM input_value LEFT JOIN input_parameter ON input_value.input_parameter_id = input_parameter.id WHERE input_parameter.problem_id = ?",
                params![&problem_id],
                |row| row.get(0),
            ).map_err(|e| DomainError::Internal(e.to_string()))?;

                if total_input_values_number == 0 {
                    transaction
                        .execute(
                            format!(
                                "DELETE FROM output_value WHERE input_value_ids LIKE '|{}|'",
                                id
                            )
                            .as_str(),
                            params![],
                        )
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                }
                {
                    let mut stmt = transaction.prepare("SELECT output_value.id, output_value.input_value_ids FROM output_value LEFT JOIN output_parameter ON output_value.output_parameter_id = output_parameter.id WHERE output_parameter.problem_id = ?").map_err(|e| DomainError::Internal(e.to_string()))?;
                    let mut output_values_rows = stmt
                        .query(rusqlite::params![&problem_id])
                        .map_err(|e| DomainError::Internal(e.to_string()))?;

                    let mut output_values = Vec::<(i64, String)>::new();
                    while let Some(row) = output_values_rows
                        .next()
                        .map_err(|e| DomainError::Internal(e.to_string()))?
                    {
                        output_values.push((
                            row.get(0)
                                .map_err(|e| DomainError::Internal(e.to_string()))?,
                            row.get(1)
                                .map_err(|e| DomainError::Internal(e.to_string()))?,
                        ));
                    }

                    for (output_value_id, input_value_ids) in output_values {
                        let input_value_ids =
                            input_value_ids.replace(format!("|{}|", id).as_str(), "");
                        let mut stmt = transaction
                            .prepare("UPDATE output_value SET input_value_ids = ? WHERE id = ?")
                            .map_err(|e| DomainError::Internal(e.to_string()))?;
                        stmt.execute(rusqlite::params![&input_value_ids, &output_value_id])
                            .map_err(|e| DomainError::Internal(e.to_string()))?;
                    }
                }
            }

            transaction
                .execute("DELETE FROM input_value WHERE id = ?", params![&id])
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            Ok(())
        };

        match result {
            Ok(_) => {
                transaction
                    .commit()
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                Ok(())
            }
            Err(e) => {
                transaction
                    .rollback()
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                Err(e)
            }
        }
    }

    fn update_by_id(&self, id: i64, model: &InputValue) -> Result<(), DomainError> {
        // Validate Ruspini partition constraints: a < b <= c < d
        if model.a >= model.b {
            return Err(DomainError::Validation(format!(
                "Invalid input_value: a ({}) must be < b ({})",
                model.a, model.b
            )));
        }
        if model.b > model.c {
            return Err(DomainError::Validation(format!(
                "Invalid input_value: b ({}) must be <= c ({})",
                model.b, model.c
            )));
        }
        if model.c >= model.d {
            return Err(DomainError::Validation(format!(
                "Invalid input_value: c ({}) must be < d ({})",
                model.c, model.d
            )));
        }
        
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let transaction = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let result: Result<(), DomainError> = {
            let mut stmt = transaction
                .prepare(
                    "UPDATE input_value SET value = ?, a = ?, b = ?, c = ?, d = ? WHERE id = ?",
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            stmt.execute(params![
                &model.value,
                &model.a,
                &model.b,
                &model.c,
                &model.d,
                &id
            ])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

            let input_parameter_id: i64 = transaction
                .query_row(
                    "SELECT input_parameter_id FROM input_value WHERE id = ?",
                    params![id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let prev_result: Result<(i64, f32, f32, f32, f32), rusqlite::Error> = transaction
                .query_row(
                    "SELECT id, a, b, c, d FROM input_value WHERE input_parameter_id = ? AND id != ? AND a < ? ORDER BY a DESC LIMIT 1",
                    params![input_parameter_id, id, model.a],
                    |row| {
                        Ok((
                            row.get(0)?,
                            row.get(1)?,
                            row.get(2)?,
                            row.get(3)?,
                            row.get(4)?,
                        ))
                    },
                );

            let next_result: Result<(i64, f32, f32, f32, f32), rusqlite::Error> = transaction
                .query_row(
                    "SELECT id, a, b, c, d FROM input_value WHERE input_parameter_id = ? AND id != ? AND a > ? ORDER BY a ASC LIMIT 1",
                    params![input_parameter_id, id, model.a],
                    |row| {
                        Ok((
                            row.get(0)?,
                            row.get(1)?,
                            row.get(2)?,
                            row.get(3)?,
                            row.get(4)?,
                        ))
                    },
                );

            match (prev_result, next_result) {
                (Ok(prev), Ok(next)) => {
                    transaction
                        .execute(
                            "UPDATE input_value SET c = ?, d = ? WHERE id = ?",
                            params![model.a, model.b, prev.0],
                        )
                        .map_err(|e| DomainError::Internal(e.to_string()))?;

                    transaction
                        .execute(
                            "UPDATE input_value SET a = ?, b = ? WHERE id = ?",
                            params![model.c, model.d, next.0],
                        )
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                }
                (Ok(prev), Err(rusqlite::Error::QueryReturnedNoRows)) => {
                    transaction
                        .execute(
                            "UPDATE input_value SET c = ?, d = ? WHERE id = ?",
                            params![model.a, model.b, prev.0],
                        )
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                }
                (Ok(_prev), Err(e)) => {
                    return Err(DomainError::Data(e.to_string()));
                }
                (Err(rusqlite::Error::QueryReturnedNoRows), Ok(next)) => {
                    transaction
                        .execute(
                            "UPDATE input_value SET a = ?, b = ? WHERE id = ?",
                            params![model.c, model.d, next.0],
                        )
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                }
                (Err(e), Ok(_next)) => {
                    return Err(DomainError::Data(e.to_string()));
                }
                (Err(rusqlite::Error::QueryReturnedNoRows), Err(rusqlite::Error::QueryReturnedNoRows)) => {
                    // Single element - nothing to adjust
                }
                (Err(prev_e), Err(_next_e)) => {
                    if !matches!(prev_e, rusqlite::Error::QueryReturnedNoRows) {
                        return Err(DomainError::Data(prev_e.to_string()));
                    }
                    return Err(DomainError::Data(_next_e.to_string()));
                }
            }

            Ok(())
        };

        match result {
            Ok(_) => {
                transaction
                    .commit()
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                Ok(())
            }
            Err(e) => {
                transaction
                    .rollback()
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                Err(e)
            }
        }
    }

    fn switch(&self, id_1: i64, id_2: i64) -> Result<(), DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let tx = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let value_1 = {
            let mut stmt = tx
                .prepare("SELECT a, b, c, d FROM input_value WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let result: (f32, f32, f32, f32) = stmt
                .query_row(params![id_1], |row| {
                    Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
                })
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            result
        };

        let value_2 = {
            let mut stmt = tx
                .prepare("SELECT a, b, c, d FROM input_value WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let result: (f32, f32, f32, f32) = stmt
                .query_row(params![id_2], |row| {
                    Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
                })
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            result
        };

        // Swap only trapezoid parameters (a, b, c, d), keep value names and IDs unchanged
        tx.execute(
            "UPDATE input_value SET a = ?, b = ?, c = ?, d = ? WHERE id = ?",
            params![value_2.0, value_2.1, value_2.2, value_2.3, id_1],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.execute(
            "UPDATE input_value SET a = ?, b = ?, c = ?, d = ? WHERE id = ?",
            params![value_1.0, value_1.1, value_1.2, value_1.3, id_2],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        // No need to update output_value table - IDs remain the same

        tx.commit()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(())
    }
}
