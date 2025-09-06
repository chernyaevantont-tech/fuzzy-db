use serde::{Deserialize, Serialize};

use crate::domain::entities::input_value::InputValue;

#[derive(Debug, Clone, Deserialize)]
pub struct CreateInputValueRequest {
    pub input_parameter_id: i64,
}
impl CreateInputValueRequest {
    pub fn to_entity(&self) -> InputValue {
        InputValue {
            id: 0,
            input_parameter_id: self.input_parameter_id,
            value: "Новое значение".to_string(),
            a: 0.,
            b: 0.,
            c: 0.,
            d: 0.,
            is_triangle: false,
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateInputValueRequest {
    pub value: String,
    pub a: f32,
    pub b: f32,
    pub c: f32,
    pub d: f32,
    pub is_triangle: bool,
}
impl UpdateInputValueRequest {
    pub fn to_entity(&self) -> InputValue {
        InputValue {
            id: 0,
            input_parameter_id: 0,
            value: self.value.to_owned(),
            a: self.a,
            b: self.b,
            c: self.c,
            d: self.d,
            is_triangle: self.is_triangle,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct InputValueResponse {
    pub id: i64,
    pub input_parameter_id: i64,
    pub value: String,
    pub a: f32,
    pub b: f32,
    pub c: f32,
    pub d: f32,
    pub is_triangle: bool,
}
impl InputValueResponse {
    pub fn from(entity: &InputValue) -> Self {
        Self {
            id: entity.id,
            input_parameter_id: entity.input_parameter_id,
            value: entity.value.to_owned(),
            a: entity.a,
            b: entity.b,
            c: entity.c,
            d: entity.d,
            is_triangle: entity.is_triangle,
        }
    }
}
