use crate::domain::{
    entities::input_value::InputValue, error::DomainError, repository::InputValueRepository,
};

pub struct UpdateInputValueByIdUseCase<'a> {
    input_value_repository: &'a dyn InputValueRepository,
}

impl<'a> UpdateInputValueByIdUseCase<'a> {
    pub fn new(input_value_repository: &'a dyn InputValueRepository) -> Self {
        Self {
            input_value_repository,
        }
    }

    pub fn execute(&self, id: i64, input_value: &InputValue) -> Result<(), DomainError> {
        self.input_value_repository.update_by_id(id, input_value)
    }
}
