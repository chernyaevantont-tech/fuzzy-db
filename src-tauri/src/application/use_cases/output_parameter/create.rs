use crate::domain::{
    entities::output_parameter::OutputParameter, error::DomainError,
    repository::OutputParameterRepository,
};

pub struct CreateOutputParameterUseCase<'a> {
    output_parameter_repository: &'a dyn OutputParameterRepository,
}

impl<'a> CreateOutputParameterUseCase<'a> {
    pub fn new(output_parameter_repository: &'a dyn OutputParameterRepository) -> Self {
        Self {
            output_parameter_repository,
        }
    }

    pub fn execute(&self, output_parameter: &OutputParameter) -> Result<i64, DomainError> {
        self.output_parameter_repository
            .create(output_parameter.problem_id, output_parameter)
    }
}
