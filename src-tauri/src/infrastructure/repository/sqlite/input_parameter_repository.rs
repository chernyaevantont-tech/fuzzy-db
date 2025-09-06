use std::sync::{Arc, Mutex};

use rusqlite::{params, Connection};

use crate::domain::{
    entities::{input_parameter::InputParameter, input_value::InputValue},
    error::DomainError,
    repository::InputParameterRepository,
};

pub struct SqliteInputParameterRepository {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteInputParameterRepository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn: conn }
    }
}

impl InputParameterRepository for SqliteInputParameterRepository {
    fn get_by_id(&self, id: i64) -> Result<InputParameter, DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let model: InputParameter = conn
            .query_row(
                "SELECT id, problem_id, name, start, end FROM input_parameter WHERE id = ?",
                params![id],
                |row| {
                    Ok(InputParameter {
                        id: row.get(0)?,
                        problem_id: row.get(1)?,
                        name: row.get(2)?,
                        start: row.get(3)?,
                        end: row.get(4)?,
                        input_values: Vec::<InputValue>::new(),
                    })
                },
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(model)
    }

    fn create(&self, problem_id: i64, model: &InputParameter) -> Result<i64, DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare(
                "INSERT INTO input_parameter (problem_id, name, start, end) VALUES (?, ?, ?, ?)",
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        stmt.execute(params![&problem_id, &model.name, &model.start, &model.end,])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let new_id = conn.last_insert_rowid();

        Ok(new_id)
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
            let problem_id: i64 = transaction
                .query_row(
                    "SELECT problem_id FROM input_parameter WHERE id = ?",
                    params![&id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let input_parameter_number: i64 = transaction
                .query_row(
                    "SELECT COUNT(*) FROM input_parameter WHERE problem_id = ?",
                    params![&problem_id],
                    |row| row.get(0),
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            if input_parameter_number == 1 {
                transaction.execute("DELETE FROM output_value WHERE id IN (SELECT output_value.id FROM output_value LEFT JOIN output_parameter ON output_value.output_parameter_id = output_parameter.id WHERE output_parameter.problem_id = ?)", params![&problem_id]).map_err(|e| DomainError::Internal(e.to_string()))?;
            } else {
                let deleting_input_value_number: i64 = transaction
                    .query_row(
                        "SELECT COUNT(*) FROM input_value WHERE input_value.input_parameter_id = ?",
                        params![&id],
                        |row| row.get(0),
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;

                if deleting_input_value_number > 0 {
                    let mut stmt =
                transaction.prepare("SELECT output_value.id, output_value.input_value_ids FROM output_value LEFT JOIN output_parameter ON output_value.output_parameter_id = output_parameter.id WHERE output_parameter.problem_id = ?").map_err(|e| DomainError::Internal(e.to_string()))?;
                    let mut output_value_rows = stmt
                        .query(rusqlite::params![&problem_id])
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                    let mut output_values = Vec::<(i64, String)>::new();
                    while let Some(row) = output_value_rows
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
                    let saving_input_value_id: i64 = transaction.query_row(
                    "SELECT id FROM input_value WHERE input_parameter_id = ? ORDER BY id LIMIT 1",
                    params![&id],
                    |row| row.get(0),
                ).map_err(|e| DomainError::Internal(e.to_string()))?;
                    let mut deleting_output_value_ids = Vec::<i64>::new();

                    for (output_value_id, input_value_ids) in output_values {
                        if input_value_ids.contains(format!("|{}|", saving_input_value_id).as_str())
                        {
                            let input_value_ids = input_value_ids
                                .replace(format!("|{}|", saving_input_value_id).as_str(), "");
                            transaction
                                .execute(
                                    "UPDATE output_value SET input_value_ids = ? WHERE id = ?",
                                    params![&input_value_ids, &output_value_id],
                                )
                                .map_err(|e| DomainError::Internal(e.to_string()))?;
                        } else {
                            deleting_output_value_ids.push(output_value_id);
                        }
                    }
                    let deleting_output_value_ids: Vec<String> = deleting_output_value_ids
                        .iter()
                        .map(|output_value| output_value.to_string())
                        .collect();

                    let mut stmt = transaction
                        .prepare(
                            format!(
                                "DELETE FROM output_value WHERE id IN ({})",
                                deleting_output_value_ids.join(", ")
                            )
                            .as_str(),
                        )
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                    stmt.execute(params![])
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                }
            }

            transaction
                .execute("DELETE FROM input_parameter WHERE id = ?", params![&id])
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

    fn update_by_id(&self, id: i64, model: &InputParameter) -> Result<(), DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let mut stmt = conn
            .prepare("UPDATE input_parameter SET name = ?, start = ?, end = ? WHERE id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        stmt.execute(params![&model.name, &model.start, &model.end, &id,])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(())
    }

    fn switch(&self, id_1: i64, id_2: i64) -> Result<(), DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let tx = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let name_1 = {
            let mut stmt = tx
                .prepare("SELECT name, start, end FROM input_parameter WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let name: String = stmt
                .query_row(params![id_1], |row| row.get(0))
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            name
        };

        let name_2 = {
            let mut stmt = tx
                .prepare("SELECT name, start, end FROM input_parameter WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let name: String = stmt
                .query_row(params![id_2], |row| row.get(0))
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            name
        };

        tx.execute(
            "UPDATE input_parameter SET name = ? WHERE id = ?",
            params![name_2, id_1],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.execute(
            "UPDATE input_parameter SET name = ? WHERE id = ?",
            params![name_1, id_2],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.execute(
            "UPDATE input_value SET input_parameter_id = 
            CASE 
                WHEN input_parameter_id = ? THEN ? 
                WHEN input_parameter_id = ? THEN ? 
                ELSE input_parameter_id 
            END 
        WHERE input_parameter_id IN (?, ?)",
            params![id_1, id_2, id_2, id_1, id_1, id_2],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.commit()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        Ok(())
    }
}
