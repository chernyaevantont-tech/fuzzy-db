use serde::{Deserialize, Serialize};

use crate::domain::entities::input_value::InputValue;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputParameter {
    pub id: i64,
    pub problem_id: i64,
    pub name: String,
    pub start: f32,
    pub end: f32,
    pub input_values: Vec<InputValue>,
}
