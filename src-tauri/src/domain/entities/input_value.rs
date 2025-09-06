use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputValue {
    pub id: i64,
    pub input_parameter_id: i64,
    pub value: String,
    pub a: f32,
    pub b: f32,
    pub c: f32,
    pub d: f32,
    pub is_triangle: bool,
}
