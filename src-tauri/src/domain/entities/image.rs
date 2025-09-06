use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Image {
    pub id: i64,
    pub image_data: Vec<u8>,
    pub image_format: String,
}
