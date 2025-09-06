use serde::{Deserialize, Serialize};

use crate::domain::entities::fuzzy_output_value::FuzzyOutputValue;

#[derive(Debug, Clone, Deserialize)]
pub struct CreateFuzzyOutputValueRequest {
    pub output_parameter_id: i64,
}
impl CreateFuzzyOutputValueRequest {
    pub fn to_entity(&self) -> FuzzyOutputValue {
        FuzzyOutputValue {
            id: 0,
            output_parameter_id: self.output_parameter_id,
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
pub struct UpdateFuzzyOutputValueRequest {
    pub value: String,
    pub a: f32,
    pub b: f32,
    pub c: f32,
    pub d: f32,
    pub is_triangle: bool,
}
impl UpdateFuzzyOutputValueRequest {
    pub fn to_entity(&self) -> FuzzyOutputValue {
        FuzzyOutputValue {
            id: 0,
            output_parameter_id: 0,
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
pub struct FuzzyOutputValueResponse {
    pub id: i64,
    pub output_parameter_id: i64,
    pub value: String,
    pub a: f32,
    pub b: f32,
    pub c: f32,
    pub d: f32,
    pub is_triangle: bool,
}
impl FuzzyOutputValueResponse {
    pub fn from(entity: &FuzzyOutputValue) -> Self {
        Self {
            id: entity.id,
            output_parameter_id: entity.output_parameter_id,
            value: entity.value.to_owned(),
            a: entity.a,
            b: entity.b,
            c: entity.c,
            d: entity.d,
            is_triangle: entity.is_triangle,
        }
    }
}
