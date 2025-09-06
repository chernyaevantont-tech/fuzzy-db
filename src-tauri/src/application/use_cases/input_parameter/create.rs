use crate::domain::{
    entities::input_parameter::InputParameter, error::DomainError,
    repository::InputParameterRepository,
};

pub struct CreateInputParameterUseCase<'a> {
    input_paremeter_repository: &'a dyn InputParameterRepository,
}

impl<'a> CreateInputParameterUseCase<'a> {
    pub fn new(input_parameter_repository: &'a dyn InputParameterRepository) -> Self {
        Self {
            input_paremeter_repository: input_parameter_repository,
        }
    }

    pub fn execute(&self, input_parameter: &InputParameter) -> Result<i64, DomainError> {
        self.input_paremeter_repository
            .create(input_parameter.problem_id, input_parameter)
    }
}
