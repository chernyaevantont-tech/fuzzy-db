use std::{
    sync::{Arc, Mutex},
};

use rusqlite::{params, Connection};

use crate::domain::{entities::image::Image, error::DomainError, repository::ImageRepository};

pub struct SqliteImageRepository {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteImageRepository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self {
            conn: conn,
        }
    }
}

impl ImageRepository for SqliteImageRepository {
    fn get_by_id(&self, id: i64) -> Result<Image, DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("SELECT id, image_data, image_format FROM image WHERE id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let image: Image = stmt
            .query_row(params![&id], |row| {
                Ok(Image {
                    id: row.get(0)?,
                    image_data: row.get(1)?,
                    image_format: row.get(2)?,
                })
            })
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(image)
    }

    fn update_by_id(&self, id: i64, model: &Image) -> Result<(), DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let mut stmt = conn
            .prepare("UPDATE image SET image_data = ?, image_format = ? WHERE id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        stmt.execute(params![&model.image_data, &model.image_format, &id])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(())
    }
}
