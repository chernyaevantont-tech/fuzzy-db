use serde::{Deserialize, Serialize};

use crate::{
    domain::entities::{fuzzy_output_value::FuzzyOutputValue, output_parameter::OutputParameter},
    infrastructure::tauri::dtos::fuzzy_output_value_dtos::FuzzyOutputValueResponse,
};

#[derive(Debug, Clone, Deserialize)]
pub struct CreateOutputParameterRequest {
    pub problem_id: i64,
}
impl CreateOutputParameterRequest {
    pub fn to_entity(&self) -> OutputParameter {
        OutputParameter {
            id: 0,
            problem_id: self.problem_id,
            name: "Новый параметр".to_string(),
            start: 0.,
            end: 1.,
            fuzzy_output_values: Vec::<FuzzyOutputValue>::new(),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateOutputParameterRequest {
    pub name: String,
    pub start: f32,
    pub end: f32,
}
impl UpdateOutputParameterRequest {
    pub fn to_entity(&self) -> OutputParameter {
        OutputParameter {
            id: 0,
            problem_id: 0,
            name: self.name.to_owned(),
            start: self.start,
            end: self.end,
            fuzzy_output_values: Vec::<FuzzyOutputValue>::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct OutputParameterResponse {
    pub id: i64,
    pub problem_id: i64,
    pub name: String,
    pub start: f32,
    pub end: f32,
    pub fuzzy_output_values: Vec<FuzzyOutputValueResponse>,
}
impl OutputParameterResponse {
    pub fn from(entity: &OutputParameter) -> Self {
        Self {
            id: entity.id,
            problem_id: entity.problem_id,
            name: entity.name.to_owned(),
            start: entity.start,
            end: entity.end,
            fuzzy_output_values: entity
                .fuzzy_output_values
                .iter()
                .map(|x| FuzzyOutputValueResponse::from(x))
                .collect(),
        }
    }
}
