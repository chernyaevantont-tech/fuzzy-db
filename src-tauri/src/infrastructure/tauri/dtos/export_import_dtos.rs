use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportedProblem {
    pub name: String,
    pub description: String,
    pub is_final: bool,
    pub image: Option<ExportedImage>,
    pub input_parameters: Vec<ExportedInputParameter>,
    pub output_parameters: Vec<ExportedOutputParameter>,
    pub output_values: Vec<ExportedOutputValue>,
    pub children: Vec<ExportedProblem>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportedImage {
    pub data: Vec<u8>,
    pub format: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportedInputParameter {
    pub temp_id: i64,
    pub name: String,
    pub start: f32,
    pub end: f32,
    pub values: Vec<ExportedInputValue>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportedInputValue {
    pub temp_id: i64,
    pub value: String,
    pub a: f32,
    pub b: f32,
    pub c: f32,
    pub d: f32,
    pub is_triangle: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportedOutputParameter {
    pub temp_id: i64,
    pub name: String,
    pub start: f32,
    pub end: f32,
    pub values: Vec<ExportedFuzzyOutputValue>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportedFuzzyOutputValue {
    pub temp_id: i64,
    pub value: String,
    pub a: f32,
    pub b: f32,
    pub c: f32,
    pub d: f32,
    pub is_triangle: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ExportedOutputValue {
    pub output_parameter_temp_id: i64,
    #[serde(alias = "fuzzy_output_value_id", rename = "fuzzy_output_value_temp_id")]
    pub fuzzy_output_value_temp_id: Option<i64>,
    pub input_value_temp_ids: Vec<i64>,
}
