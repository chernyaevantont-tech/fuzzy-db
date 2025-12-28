use crate::domain::{error::DomainError, repository::InputValueRepository};

pub struct RemoveInputValueByIdUseCase<'a> {
    input_value_repository: &'a dyn InputValueRepository,
}

impl<'a> RemoveInputValueByIdUseCase<'a> {
    pub fn new(input_value_repository: &'a dyn InputValueRepository) -> Self {
        Self {
            input_value_repository,
        }
    }

    pub fn execute(&self, id: i64) -> Result<(), DomainError> {
        self.input_value_repository.remove_by_id(id)
    }
}
