use crate::domain::{error::DomainError, repository::FuzzyOutputValueRepository};

pub struct RemoveFuzzyOutputValueByIdUseCase<'a> {
    fuzzy_output_value_repository: &'a dyn FuzzyOutputValueRepository,
}

impl<'a> RemoveFuzzyOutputValueByIdUseCase<'a> {
    pub fn new(fuzzy_output_value_repository: &'a dyn FuzzyOutputValueRepository) -> Self {
        Self {
            fuzzy_output_value_repository,
        }
    }

    pub fn execute(&self, id: i64) -> Result<(), DomainError> {
        self.fuzzy_output_value_repository.remove_by_id(id)
    }
}
