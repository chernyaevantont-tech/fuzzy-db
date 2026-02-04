use crate::domain::{
    entities::output_value::OutputValue, error::DomainError, repository::OutputValueRepository,
};

pub struct CreateOutputValueUseCase<'a> {
    output_value_repository: &'a dyn OutputValueRepository,
}

impl<'a> CreateOutputValueUseCase<'a> {
    pub fn new(output_value_repository: &'a dyn OutputValueRepository) -> Self {
        Self {
            output_value_repository,
        }
    }

    pub fn execute(&self, output_value: &OutputValue) -> Result<i64, DomainError> {
        self.output_value_repository.create(output_value)
    }
}
