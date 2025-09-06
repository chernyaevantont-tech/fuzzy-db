use serde::{Deserialize, Serialize};

use crate::domain::entities::{
    image::Image, input_parameter::InputParameter, output_parameter::OutputParameter,
    output_value::OutputValue,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Problem {
    pub id: i64,
    pub prev_problem_id: Option<i64>,
    pub is_final: bool,
    pub name: String,
    pub description: String,
    pub image_id: Option<i64>,
    pub created_at: String,
    pub updated_at: Option<String>,
    pub input_parameters: Vec<InputParameter>,
    pub output_parameters: Vec<OutputParameter>,
    pub output_values: Vec<OutputValue>,
    pub image: Option<Image>,
}
