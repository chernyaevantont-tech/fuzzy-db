use crate::domain::{error::DomainError, repository::InputParameterRepository};

pub struct RemoveInputParameterByIdUseCase<'a> {
    input_parameter_repository: &'a dyn InputParameterRepository,
}

impl<'a> RemoveInputParameterByIdUseCase<'a> {
    pub fn new(input_parameter_repository: &'a dyn InputParameterRepository) -> Self {
        Self {
            input_parameter_repository: input_parameter_repository,
        }
    }

    pub fn execute(&self, id: i64) -> Result<(), DomainError> {
        self.input_parameter_repository.remove_by_id(id)
    }
}
