use crate::domain::{entities::input_parameter::InputParameter, error::DomainError, repository::InputParameterRepository};

pub struct UpdateInputParameterByIdUseCase<'a> {
    input_parameter_repository: &'a dyn InputParameterRepository,
}

impl<'a> UpdateInputParameterByIdUseCase<'a> {
    pub fn new(input_parameter_repository: &'a dyn InputParameterRepository) -> Self {
        Self {
            input_parameter_repository: input_parameter_repository,
        }
    }

    pub fn execute(&self, id: i64, model: &InputParameter) -> Result<(), DomainError> {
        self.input_parameter_repository.update_by_id(id, model)
    }
}