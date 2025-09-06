use serde::{Deserialize, Serialize};

use crate::domain::entities::image::Image;

#[derive(Debug, Clone, Deserialize)]
pub struct CreateImageRequest {
    pub image_data: Vec<u8>,
    pub image_format: String,
}
impl CreateImageRequest {
    pub fn to_entity(&self) -> Image {
        Image {
            id: 0,
            image_data: self.image_data.to_owned(),
            image_format: self.image_format.to_owned(),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateImageRequest {
    pub image_data: Vec<u8>,
    pub image_format: String,
}
impl UpdateImageRequest {
    pub fn to_entity(&self) -> Image {
        Image {
            id: 0,
            image_data: self.image_data.to_owned(),
            image_format: self.image_format.to_owned(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct ImageResponse {
    pub id: i64,
    pub image_data: Vec<u8>,
    pub image_format: String,
}
impl ImageResponse {
    pub fn from(entity: Image) -> Self {
        Self {
            id: entity.id,
            image_data: entity.image_data.to_owned(),
            image_format: entity.image_format.to_owned(),
        }
    }
}
