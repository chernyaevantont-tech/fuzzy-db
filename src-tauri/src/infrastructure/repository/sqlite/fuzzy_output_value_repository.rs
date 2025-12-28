use std::sync::{Arc, Mutex};

use rusqlite::{params, Connection};

use crate::domain::{
    entities::fuzzy_output_value::FuzzyOutputValue, error::DomainError,
    repository::FuzzyOutputValueRepository,
};

pub struct SqliteFuzzyOutputValueRepository {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteFuzzyOutputValueRepository {
    pub fn create(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn: conn }
    }
}

impl FuzzyOutputValueRepository for SqliteFuzzyOutputValueRepository {
    fn create(&self, model: &FuzzyOutputValue) -> Result<i64, DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let transaction = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let result: Result<i64, DomainError> = {
            let number_of_fuzzy_output_values: i64 = transaction
                .query_row(
                    "SELECT COUNT(*) FROM fuzzy_output_value WHERE output_parameter_id = ?",
                    params![&model.output_parameter_id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let (output_parameter_start, output_parameter_end): (f32, f32) = transaction
                .query_row(
                    "SELECT start, end FROM output_parameter WHERE id = ?",
                    params![model.output_parameter_id],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let a: f32;
            let b: f32;
            let c: f32;
            let d: f32;

            if number_of_fuzzy_output_values > 0 {
                let (prev_id, _a, _d): (i64, f32, f32) = transaction
                    .query_row(
                        "SELECT id, a, d FROM fuzzy_output_value WHERE output_parameter_id = ? ORDER BY d DESC LIMIT 1",
                        params![model.output_parameter_id],
                        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;

                let mid = _a + (_d - _a) / 2.0;
                let pivot = (_d - _a) / 8.0;

                let prev_a = _a;
                let prev_b = _a + pivot;
                let prev_c = mid - pivot;
                let prev_d = mid + pivot;

                transaction
                    .execute(
                        "UPDATE fuzzy_output_value SET a = ?, b = ?, c = ?, d = ? WHERE id = ?",
                        params![prev_a, prev_b, prev_c, prev_d, prev_id],
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;

                a = mid - pivot;
                b = mid + pivot;
                c = _d - pivot;
                d = _d;
            } else {
                a = output_parameter_start;
                b = output_parameter_start + (output_parameter_end - output_parameter_start) * 0.25;
                c = output_parameter_start + (output_parameter_end - output_parameter_start) * 0.75;
                d = output_parameter_end;
            }

            let mut stmt = transaction
                .prepare("INSERT INTO fuzzy_output_value (output_parameter_id, value, a, b, c, d) VALUES (?, ?, ?, ?, ?, ?)")
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            stmt.execute(params![
                &model.output_parameter_id,
                &model.value,
                &a,
                &b,
                &c,
                &d,
            ])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

            Ok(transaction.last_insert_rowid())
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
            let output_parameter_id: i64 = transaction
                .query_row(
                    "SELECT output_parameter_id FROM fuzzy_output_value WHERE id = ? LIMIT 1",
                    params![&id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let fuzzy_output_values_number: i64 = transaction
                .query_row(
                    "SELECT COUNT(*) FROM fuzzy_output_value WHERE output_parameter_id = ?",
                    params![&output_parameter_id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            if fuzzy_output_values_number > 1 {
                let (a, _b, _c, d): (f32, f32, f32, f32) = transaction
                    .query_row(
                        "SELECT a, b, c, d FROM fuzzy_output_value WHERE id = ?",
                        params![id],
                        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;

                let prev_result: Result<(i64, f32, f32, f32, f32), rusqlite::Error> = transaction
                    .query_row(
                        "SELECT id, a, b, c, d FROM fuzzy_output_value WHERE output_parameter_id = ? AND a < ? ORDER BY a DESC LIMIT 1",
                        params![output_parameter_id, a],
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
                        "SELECT id, a, b, c, d FROM fuzzy_output_value WHERE output_parameter_id = ? AND a > ? ORDER BY a ASC LIMIT 1",
                        params![output_parameter_id, a],
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
                                "UPDATE fuzzy_output_value SET c = ?, d = ? WHERE id = ?",
                                params![prev_c, prev_d, prev.0],
                            )
                            .map_err(|e| DomainError::Internal(e.to_string()))?;

                        let next_a = prev_c;
                        let next_b = prev_d;

                        transaction
                            .execute(
                                "UPDATE fuzzy_output_value SET a = ?, b = ? WHERE id = ?",
                                params![next_a, next_b, next.0],
                            )
                            .map_err(|e| DomainError::Internal(e.to_string()))?;
                    }
                    (Ok(prev), Err(rusqlite::Error::QueryReturnedNoRows)) => {
                        // No next element - we're deleting the last one, extend prev to end
                        transaction
                            .execute(
                                "UPDATE fuzzy_output_value SET c = ?, d = ? WHERE id = ?",
                                params![_c, d, prev.0],
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
                                "UPDATE fuzzy_output_value SET a = ?, b = ? WHERE id = ?",
                                params![a, _b, next.0],
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
                        if !matches!(prev_e, rusqlite::Error::QueryReturnedNoRows) {
                            return Err(DomainError::Data(prev_e.to_string()));
                        }
                        return Err(DomainError::Data(_next_e.to_string()));
                    }
                }
            }

            transaction
                .execute("DELETE FROM fuzzy_output_value WHERE id = ?", params![&id])
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            // Clean up output_value references
            transaction
                .execute(
                    "UPDATE output_value SET fuzzy_output_value_id = NULL WHERE fuzzy_output_value_id = ?",
                    params![&id],
                )
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

    fn update_by_id(&self, id: i64, model: &FuzzyOutputValue) -> Result<(), DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let transaction = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let result: Result<(), DomainError> = {
            let output_parameter_id: i64 = transaction
                .query_row(
                    "SELECT output_parameter_id FROM fuzzy_output_value WHERE id = ?",
                    params![id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            transaction
                .execute(
                    "UPDATE fuzzy_output_value SET value = ?, a = ?, b = ?, c = ?, d = ? WHERE id = ?",
                    params![
                        &model.value,
                        &model.a,
                        &model.b,
                        &model.c,
                        &model.d,
                        &id
                    ],
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let prev_result: Result<(i64, f32, f32, f32, f32), rusqlite::Error> = transaction
                .query_row(
                    "SELECT id, a, b, c, d FROM fuzzy_output_value WHERE output_parameter_id = ? AND id != ? AND a < ? ORDER BY a DESC LIMIT 1",
                    params![output_parameter_id, id, model.a],
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
                    "SELECT id, a, b, c, d FROM fuzzy_output_value WHERE output_parameter_id = ? AND id != ? AND a > ? ORDER BY a ASC LIMIT 1",
                    params![output_parameter_id, id, model.a],
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
                            "UPDATE fuzzy_output_value SET c = ?, d = ? WHERE id = ?",
                            params![model.a, model.b, prev.0],
                        )
                        .map_err(|e| DomainError::Internal(e.to_string()))?;

                    transaction
                        .execute(
                            "UPDATE fuzzy_output_value SET a = ?, b = ? WHERE id = ?",
                            params![model.c, model.d, next.0],
                        )
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                }
                (Ok(prev), Err(rusqlite::Error::QueryReturnedNoRows)) => {
                    transaction
                        .execute(
                            "UPDATE fuzzy_output_value SET c = ?, d = ? WHERE id = ?",
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
                            "UPDATE fuzzy_output_value SET a = ?, b = ? WHERE id = ?",
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
                .prepare("SELECT value FROM fuzzy_output_value WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            let value: String = stmt
                .query_row(params![&id_1], |row| row.get(0))
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            value
        };

        let value_2 = {
            let mut stmt = tx
                .prepare("SELECT value FROM fuzzy_output_value WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            let value: String = stmt
                .query_row(params![&id_2], |row| row.get(0))
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            value
        };

        tx.execute(
            "UPDATE fuzzy_output_value SET value = ? WHERE id = ?",
            params![value_2, id_1],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.execute(
            "UPDATE fuzzy_output_value SET value = ? WHERE id = ?",
            params![value_1, id_2],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.execute(
            "UPDATE output_value SET fuzzy_output_value_id = 
            CASE 
                WHEN fuzzy_output_value_id = ? THEN ? 
                WHEN fuzzy_output_value_id = ? THEN ? 
                ELSE fuzzy_output_value_id 
            END 
        WHERE fuzzy_output_value_id IN (?, ?)",
            params![id_1, id_2, id_2, id_1, id_1, id_2],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.commit()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        Ok(())
    }
}
