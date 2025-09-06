use serde::{Deserialize, Serialize};

use crate::{
    domain::entities::{input_parameter::InputParameter, input_value::InputValue},
    infrastructure::tauri::dtos::input_value_dtos::InputValueResponse,
};

#[derive(Debug, Clone, Deserialize)]
pub struct CreateInputParameterRequest {
    pub problem_id: i64,
}
impl CreateInputParameterRequest {
    pub fn to_entity(&self) -> InputParameter {
        InputParameter {
            id: 0,
            problem_id: self.problem_id,
            name: "Новый параметр".to_string(),
            start: 0.,
            end: 1.,
            input_values: Vec::<InputValue>::new(),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateInputParameterRequest {
    pub name: String,
    pub start: f32,
    pub end: f32,
}
impl UpdateInputParameterRequest {
    pub fn to_entity(&self) -> InputParameter {
        InputParameter {
            id: 0,
            problem_id: 0,
            name: self.name.to_owned(),
            start: self.start,
            end: self.end,
            input_values: Vec::<InputValue>::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct InputParameterResponse {
    pub id: i64,
    pub problem_id: i64,
    pub name: String,
    pub start: f32,
    pub end: f32,
    pub input_values: Vec<InputValueResponse>,
}
impl InputParameterResponse {
    pub fn from(entity: &InputParameter) -> Self {
        Self {
            id: entity.id,
            problem_id: entity.problem_id,
            name: entity.name.to_owned(),
            start: entity.start,
            end: entity.end,
            input_values: entity
                .input_values
                .iter()
                .map(|x| InputValueResponse::from(x))
                .collect(),
        }
    }
}
