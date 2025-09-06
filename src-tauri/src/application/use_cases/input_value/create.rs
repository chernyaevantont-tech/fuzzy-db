use crate::domain::{entities::input_value::InputValue, error::DomainError, repository::InputValueRepository};

pub struct CreateInputValueUseCase<'a> {
    input_value_repository: &'a dyn InputValueRepository,
}

impl<'a> CreateInputValueUseCase<'a> {
    pub fn new(input_value_repository: &'a dyn InputValueRepository) -> Self {
        Self {
            input_value_repository: input_value_repository
        }
    }

    pub fn execute(&self, input_value: &InputValue) -> Result<i64, DomainError> {
        self.input_value_repository.create(input_value)
    }
}