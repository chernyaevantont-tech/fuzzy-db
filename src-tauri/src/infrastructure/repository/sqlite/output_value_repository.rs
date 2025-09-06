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
    fn update_by_id(&self, id: i64, model: &OutputValue) -> Result<(), DomainError> {
        let conn = self.conn.lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("UPDATE output_value SET output_parameter_id = ? WHERE id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        stmt.execute(params![&model.output_parameter_id, &id])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(())
    }
}
