use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutputValue {
    pub id: i64,
    pub output_parameter_id: i64,
    pub fuzzy_output_value_id: Option<i64>,
    pub input_value_ids: String,
}
