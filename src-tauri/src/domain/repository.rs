use crate::domain::{
    entities::{
        fuzzy_output_value::FuzzyOutputValue, image::*, input_parameter::InputParameter,
        input_value::InputValue, output_parameter::OutputParameter, output_value::OutputValue,
        problem::*,
    },
    error::DomainError,
};

pub trait ProblemRepository: Send + Sync {
    fn get_all_by_prev_problem_id(&self, id: Option<i64>) -> Result<Vec<Problem>, DomainError>;
    fn get_full_by_id(&self, id: i64) -> Result<Problem, DomainError>;
    fn create(&self, model: &Problem) -> Result<(i64, Option<i64>), DomainError>;
    fn remove_by_id(&self, id: i64) -> Result<(), DomainError>;
    fn update_by_id(&self, id: i64, model: &Problem) -> Result<(), DomainError>;
    fn is_final(&self, id: i64) -> Result<bool, DomainError>;
}

pub trait ImageRepository: Send + Sync {
    fn get_by_id(&self, id: i64) -> Result<Image, DomainError>;
    fn update_by_id(&self, id: i64, model: &Image) -> Result<(), DomainError>;
}

pub trait InputParameterRepository: Send + Sync {
    fn get_by_id(&self, id: i64) -> Result<InputParameter, DomainError>;
    fn create(&self, problem_id: i64, model: &InputParameter) -> Result<i64, DomainError>;
    fn remove_by_id(&self, id: i64) -> Result<(), DomainError>;
    fn update_by_id(&self, id: i64, model: &InputParameter) -> Result<(), DomainError>;
    fn switch(&self, id_1: i64, id_2: i64) -> Result<(), DomainError>;
}

pub trait InputValueRepository: Send + Sync {
    fn get_by_input_parameter_id(&self, input_parameter_id: i64) -> Result<Vec<InputValue>, DomainError>;
    fn create(&self, model: &InputValue) -> Result<i64, DomainError>;
    fn remove_by_id(&self, id: i64) -> Result<(), DomainError>;
    fn update_by_id(&self, id: i64, model: &InputValue) -> Result<(), DomainError>;
    fn switch(&self, id_1: i64, id_2: i64) -> Result<(), DomainError>;
}

pub trait OutputParameterRepository: Send + Sync {
    fn get_by_id(&self, id: i64) -> Result<OutputParameter, DomainError>;
    fn create(&self, problem_id: i64, model: &OutputParameter) -> Result<i64, DomainError>;
    fn remove_by_id(&self, id: i64) -> Result<(), DomainError>;
    fn update_by_id(&self, id: i64, model: &OutputParameter) -> Result<(), DomainError>;
    fn switch(&self, id_1: i64, id_2: i64) -> Result<(), DomainError>;
}

pub trait FuzzyOutputValueRepository: Send + Sync {
    fn get_by_output_parameter_id(&self, output_parameter_id: i64) -> Result<Vec<FuzzyOutputValue>, DomainError>;
    fn create(&self, model: &FuzzyOutputValue) -> Result<i64, DomainError>;
    fn remove_by_id(&self, id: i64) -> Result<(), DomainError>;
    fn update_by_id(&self, id: i64, model: &FuzzyOutputValue) -> Result<(), DomainError>;
    fn switch(&self, id_1: i64, id_2: i64) -> Result<(), DomainError>;
}

pub trait OutputValueRepository: Send + Sync {
    fn create(&self, model: &OutputValue) -> Result<i64, DomainError>;
    fn update_by_id(&self, id: i64, model: &OutputValue) -> Result<(), DomainError>;
    fn update_fuzzy_output_value(&self, id: i64, fuzzy_output_value_id: Option<i64>) -> Result<(), DomainError>;
    fn get_by_problem_id(&self, problem_id: i64) -> Result<Vec<OutputValue>, DomainError>;
}
