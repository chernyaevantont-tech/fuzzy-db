use crate::domain::{error::DomainError, repository::OutputParameterRepository};

pub struct RemoveOutputParameterByIdUseCase<'a> {
    output_parameter_repository: &'a dyn OutputParameterRepository,
}

impl<'a> RemoveOutputParameterByIdUseCase<'a> {
    pub fn new(output_parameter_repository: &'a dyn OutputParameterRepository) -> Self {
        Self {
            output_parameter_repository,
        }
    }

    pub fn execute(&self, id: i64) -> Result<(), DomainError> {
        self.output_parameter_repository.remove_by_id(id)
    }
}
