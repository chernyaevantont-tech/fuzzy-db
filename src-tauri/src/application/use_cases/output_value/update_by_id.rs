use crate::domain::{error::DomainError, repository::OutputValueRepository};

pub struct UpdateOutputValueByIdUseCase<'a> {
    output_value_repository: &'a dyn OutputValueRepository,
}

impl<'a> UpdateOutputValueByIdUseCase<'a> {
    pub fn new(output_value_repository: &'a dyn OutputValueRepository) -> Self {
        Self {
            output_value_repository,
        }
    }

    pub fn execute(&self, id: i64, fuzzy_output_value_id: Option<i64>) -> Result<(), DomainError> {
        self.output_value_repository
            .update_fuzzy_output_value(id, fuzzy_output_value_id)
    }
}
