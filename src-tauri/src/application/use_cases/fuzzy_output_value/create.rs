use crate::domain::{
    entities::fuzzy_output_value::FuzzyOutputValue, error::DomainError,
    repository::FuzzyOutputValueRepository,
};

pub struct CreateFuzzyOutputValueUseCase<'a> {
    fuzzy_output_value_repository: &'a dyn FuzzyOutputValueRepository,
}

impl<'a> CreateFuzzyOutputValueUseCase<'a> {
    pub fn new(fuzzy_output_value_repository: &'a dyn FuzzyOutputValueRepository) -> Self {
        Self {
            fuzzy_output_value_repository,
        }
    }

    pub fn execute(&self, fuzzy_output_value: &FuzzyOutputValue) -> Result<i64, DomainError> {
        self.fuzzy_output_value_repository.create(fuzzy_output_value)
    }
}
