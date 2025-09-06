use serde::{Deserialize, Serialize};

use crate::domain::entities::fuzzy_output_value::FuzzyOutputValue;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutputParameter {
    pub id: i64,
    pub problem_id: i64,
    pub name: String,
    pub start: f32,
    pub end: f32,
    pub fuzzy_output_values: Vec<FuzzyOutputValue>,
}
