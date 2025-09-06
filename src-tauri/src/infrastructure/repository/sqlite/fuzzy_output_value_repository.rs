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
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("INSERT INTO fuzzy_output_value (output_parameter_id, value, a, b, c, d) VALUES (?, ?, ?, ?, ?, ?)").map_err(|e| DomainError::Internal(e.to_string()))?;
        stmt.execute(params![
            &model.output_parameter_id,
            &model.value,
            &model.a,
            &model.b,
            &model.c,
            &model.d,
        ])
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(conn.last_insert_rowid())
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
            let mut stmt = transaction
                .prepare("DELETE FROM fuzzy_output_value WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            stmt.execute(params![&id])
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            let mut stmt = transaction
                .prepare("UPDATE fuzzy_output_value SET fuzzy_output_parameter_id = NULL WHERE output_parameter_id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            stmt.execute(params![&id])
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
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare(
                "UPDATE fuzzy_output_value SET value = ?, a = ?, b = ?, c = ?, d = ? WHERE id = ?",
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
