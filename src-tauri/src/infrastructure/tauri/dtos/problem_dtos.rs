use serde::{Deserialize, Serialize};

use crate::{
    domain::entities::{
        image::Image, input_parameter::InputParameter, output_parameter::OutputParameter,
        output_value::OutputValue, problem::Problem,
    },
    infrastructure::tauri::dtos::{
        image_dtos::CreateImageRequest, input_parameter_dtos::InputParameterResponse,
        output_parameter_dtos::OutputParameterResponse, output_value_dtos::OutputValueResponse,
    },
};

#[derive(Debug, Clone, Serialize)]
pub struct ProblemResponse {
    pub id: i64,
    pub prev_problem_id: Option<i64>,
    pub is_final: bool,
    pub name: String,
    pub description: String,
    pub image_id: Option<i64>,
    pub created_at: String,
    pub updated_at: Option<String>,
}
impl ProblemResponse {
    pub fn from(entity: &Problem) -> Self {
        Self {
            id: entity.id,
            prev_problem_id: entity.prev_problem_id,
            is_final: entity.is_final,
            name: entity.name.to_owned(),
            description: entity.description.to_owned(),
            image_id: entity.image_id,
            created_at: entity.created_at.to_owned(),
            updated_at: entity.updated_at.to_owned(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct ProblemFullResponse {
    pub id: i64,
    pub prev_problem_id: Option<i64>,
    pub is_final: bool,
    pub name: String,
    pub description: String,
    pub image_id: Option<i64>,
    pub created_at: String,
    pub updated_at: Option<String>,
    pub input_parameters: Vec<InputParameterResponse>,
    pub output_parameters: Vec<OutputParameterResponse>,
    pub output_values: Vec<OutputValueResponse>,
}
impl ProblemFullResponse {
    pub fn from(entity: &Problem) -> Self {
        Self {
            id: entity.id,
            prev_problem_id: entity.prev_problem_id,
            is_final: entity.is_final,
            name: entity.name.to_owned(),
            description: entity.description.to_owned(),
            image_id: entity.image_id,
            created_at: entity.created_at.to_owned(),
            updated_at: entity.updated_at.to_owned(),
            input_parameters: entity
                .input_parameters
                .iter()
                .map(|x| InputParameterResponse::from(x))
                .collect(),
            output_parameters: entity
                .output_parameters
                .iter()
                .map(|x| OutputParameterResponse::from(x))
                .collect(),
            output_values: entity
                .output_values
                .iter()
                .map(|x| OutputValueResponse::from(x))
                .collect(),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateProblemRequest {
    pub prev_problem_id: Option<i64>,
    pub is_final: bool,
    pub name: String,
    pub description: String,
    pub image: Option<CreateImageRequest>,
}
impl CreateProblemRequest {
    pub fn to_entity(&self) -> Problem {
        Problem {
            id: 0,
            prev_problem_id: self.prev_problem_id,
            is_final: self.is_final,
            name: self.name.to_owned(),
            description: self.description.to_owned(),
            image_id: None,
            created_at: String::new(),
            updated_at: None,
            input_parameters: Vec::<InputParameter>::new(),
            output_parameters: Vec::<OutputParameter>::new(),
            output_values: Vec::<OutputValue>::new(),
            image: match &self.image {
                None => None,
                Some(i) => Some(Image {
                    id: 0,
                    image_data: i.image_data.to_owned(),
                    image_format: i.image_format.to_owned(),
                }),
            },
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct ProblemCreateResponse {
    pub id: i64,
    pub image_id: Option<i64>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateProblemRequest {
    pub name: String,
    pub description: String,
}
impl UpdateProblemRequest {
    pub fn to_entity(&self) -> Problem {
        Problem {
            id: 0,
            prev_problem_id: None,
            is_final: false,
            name: self.name.to_owned(),
            description: self.description.to_owned(),
            image_id: None,
            created_at: String::new(),
            updated_at: None,
            input_parameters: Vec::<InputParameter>::new(),
            output_parameters: Vec::<OutputParameter>::new(),
            output_values: Vec::<OutputValue>::new(),
            image: None,
        }
    }
}
