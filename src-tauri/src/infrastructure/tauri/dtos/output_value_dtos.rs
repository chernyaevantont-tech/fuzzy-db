use serde::{Deserialize, Serialize};

use crate::domain::entities::output_value::OutputValue;

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateOutputValueRequest {
    pub fuzzy_output_value_id: Option<i64>,
}
impl UpdateOutputValueRequest {
    pub fn to_entity(&self) -> OutputValue {
        OutputValue {
            id: 0,
            output_parameter_id: 0,
            fuzzy_output_value_id: self.fuzzy_output_value_id,
            input_value_ids: String::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct OutputValueResponse {
    pub id: i64,
    pub output_parameter_id: i64,
    pub fuzzy_output_value_id: Option<i64>,
    pub input_value_ids: String,
}

impl OutputValueResponse {
    pub fn from(entity: &OutputValue) -> OutputValueResponse {
        OutputValueResponse {
            id: entity.id,
            output_parameter_id: entity.output_parameter_id,
            fuzzy_output_value_id: entity.fuzzy_output_value_id,
            input_value_ids: entity.input_value_ids.to_owned(),
        }
    }
}
