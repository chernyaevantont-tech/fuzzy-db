use crate::domain::{
    entities::fuzzy_output_value::FuzzyOutputValue, error::DomainError,
    repository::FuzzyOutputValueRepository,
};

pub struct UpdateFuzzyOutputValueByIdUseCase<'a> {
    fuzzy_output_value_repository: &'a dyn FuzzyOutputValueRepository,
}

impl<'a> UpdateFuzzyOutputValueByIdUseCase<'a> {
    pub fn new(fuzzy_output_value_repository: &'a dyn FuzzyOutputValueRepository) -> Self {
        Self {
            fuzzy_output_value_repository,
        }
    }

    pub fn execute(&self, id: i64, model: &FuzzyOutputValue) -> Result<(), DomainError> {
        self.fuzzy_output_value_repository.update_by_id(id, model)
    }
}
