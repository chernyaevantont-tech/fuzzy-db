use std::sync::{Arc, Mutex};

use rusqlite::{params, Connection};

use crate::domain::{
    entities::output_value::OutputValue, error::DomainError, repository::OutputValueRepository,
};

pub struct SqliteOutputValueRepository {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteOutputValueRepository {
    pub fn create(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn: conn }
    }
}

impl OutputValueRepository for SqliteOutputValueRepository {
    fn create(&self, model: &OutputValue) -> Result<i64, DomainError> {
        let conn = self.conn.lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("INSERT INTO output_value (output_parameter_id, fuzzy_output_value_id, input_value_ids) VALUES (?, ?, ?)")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        stmt.execute(params![
            &model.output_parameter_id,
            &model.fuzzy_output_value_id,
            &model.input_value_ids
        ])
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(conn.last_insert_rowid())
    }

    fn update_by_id(&self, id: i64, model: &OutputValue) -> Result<(), DomainError> {
        let conn = self.conn.lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("UPDATE output_value SET output_parameter_id = ?, fuzzy_output_value_id = ?, input_value_ids = ? WHERE id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        stmt.execute(params![
            &model.output_parameter_id,
            &model.fuzzy_output_value_id,
            &model.input_value_ids,
            &id
        ])
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(())
    }

    fn update_fuzzy_output_value(&self, id: i64, fuzzy_output_value_id: Option<i64>) -> Result<(), DomainError> {
        let conn = self.conn.lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("UPDATE output_value SET fuzzy_output_value_id = ? WHERE id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        stmt.execute(params![&fuzzy_output_value_id, &id])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(())
    }

    fn get_by_problem_id(&self, problem_id: i64) -> Result<Vec<OutputValue>, DomainError> {
        let conn = self.conn.lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare(
                "SELECT ov.id, ov.output_parameter_id, ov.fuzzy_output_value_id, ov.input_value_ids 
                 FROM output_value ov
                 JOIN output_parameter op ON ov.output_parameter_id = op.id
                 WHERE op.problem_id = ?"
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let output_values = stmt
            .query_map(params![&problem_id], |row| {
                Ok(OutputValue {
                    id: row.get(0)?,
                    output_parameter_id: row.get(1)?,
                    fuzzy_output_value_id: row.get(2)?,
                    input_value_ids: row.get(3)?,
                })
            })
            .map_err(|e| DomainError::Internal(e.to_string()))?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(output_values)
    }
}
