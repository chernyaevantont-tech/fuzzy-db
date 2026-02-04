use crate::domain::{
    entities::output_value::OutputValue, error::DomainError, repository::OutputValueRepository,
};

pub struct GetOutputValuesByProblemIdUseCase<'a> {
    output_value_repository: &'a dyn OutputValueRepository,
}

impl<'a> GetOutputValuesByProblemIdUseCase<'a> {
    pub fn new(output_value_repository: &'a dyn OutputValueRepository) -> Self {
        Self {
            output_value_repository,
        }
    }

    pub fn execute(&self, problem_id: i64) -> Result<Vec<OutputValue>, DomainError> {
        self.output_value_repository.get_by_problem_id(problem_id)
    }
}
