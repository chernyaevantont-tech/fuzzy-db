use crate::domain::{
    entities::output_parameter::OutputParameter, error::DomainError,
    repository::OutputParameterRepository,
};

pub struct UpdateOutputParameterByIdUseCase<'a> {
    output_parameter_repository: &'a dyn OutputParameterRepository,
}

impl<'a> UpdateOutputParameterByIdUseCase<'a> {
    pub fn new(output_parameter_repository: &'a dyn OutputParameterRepository) -> Self {
        Self {
            output_parameter_repository,
        }
    }

    pub fn execute(&self, id: i64, model: &OutputParameter) -> Result<(), DomainError> {
        self.output_parameter_repository.update_by_id(id, model)
    }
}
