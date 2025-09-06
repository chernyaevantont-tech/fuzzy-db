use crate::domain::{entities::image::Image, error::DomainError, repository::ImageRepository};

pub struct GetByIdUseCase<'a> {
    image_repository: &'a dyn ImageRepository,
}

impl<'a> GetByIdUseCase<'a> {
    pub fn new(image_repository: &'a dyn ImageRepository) -> Self {
        Self {
            image_repository: image_repository,
        }
    }

    pub fn execute(&self, id: i64) -> Result<Image, DomainError> {
        self.image_repository.get_by_id(id)
    }
}
