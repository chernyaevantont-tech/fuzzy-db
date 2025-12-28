use serde::{Deserialize, Serialize};

use crate::application::use_cases::fuzzy_inference::{
    FuzzyEvaluationInput, FuzzyEvaluationOutputResult, FuzzyEvaluationResult, FuzzifiedInputInfo,
};
use crate::domain::services::defuzzification::DefuzzificationMethod;

/// Request DTO for fuzzy system evaluation
#[derive(Debug, Clone, Deserialize)]
pub struct EvaluateFuzzySystemRequest {
    pub problem_id: i64,
    pub inputs: Vec<FuzzyInputDto>,
    pub method: String, // "centroid", "bisector", "mom", "som", "lom"
    pub resolution: Option<usize>,
}

impl EvaluateFuzzySystemRequest {
    pub fn get_method(&self) -> DefuzzificationMethod {
        match self.method.to_lowercase().as_str() {
            "centroid" | "cog" | "coa" => DefuzzificationMethod::Centroid,
            "bisector" | "boa" => DefuzzificationMethod::Bisector,
            "mom" | "mean_of_maximum" => DefuzzificationMethod::MeanOfMaximum,
            "som" | "smallest_of_maximum" => DefuzzificationMethod::SmallestOfMaximum,
            "lom" | "largest_of_maximum" => DefuzzificationMethod::LargestOfMaximum,
            _ => DefuzzificationMethod::Centroid, // default
        }
    }

    pub fn get_resolution(&self) -> usize {
        self.resolution.unwrap_or(100)
    }

    pub fn to_inputs(&self) -> Vec<FuzzyEvaluationInput> {
        self.inputs
            .iter()
            .map(|i| FuzzyEvaluationInput {
                input_parameter_id: i.input_parameter_id,
                crisp_value: i.crisp_value,
            })
            .collect()
    }
}

/// Input DTO for a single fuzzy input
#[derive(Debug, Clone, Deserialize)]
pub struct FuzzyInputDto {
    pub input_parameter_id: i64,
    pub crisp_value: f32,
}

/// Response DTO for fuzzy system evaluation
#[derive(Debug, Clone, Serialize)]
pub struct EvaluateFuzzySystemResponse {
    pub problem_id: i64,
    pub problem_name: String,
    pub outputs: Vec<FuzzyOutputResultDto>,
}

impl From<FuzzyEvaluationResult> for EvaluateFuzzySystemResponse {
    fn from(result: FuzzyEvaluationResult) -> Self {
        Self {
            problem_id: result.problem_id,
            problem_name: result.problem_name,
            outputs: result.outputs.into_iter().map(|o| o.into()).collect(),
        }
    }
}

/// Output result DTO for a single output parameter
#[derive(Debug, Clone, Serialize)]
pub struct FuzzyOutputResultDto {
    pub output_parameter_id: i64,
    pub output_parameter_name: String,
    pub crisp_value: f32,
    pub fuzzified_inputs: Vec<FuzzifiedInputInfoDto>,
    pub fired_rules_count: usize,
}

impl From<FuzzyEvaluationOutputResult> for FuzzyOutputResultDto {
    fn from(result: FuzzyEvaluationOutputResult) -> Self {
        Self {
            output_parameter_id: result.output_parameter_id,
            output_parameter_name: result.output_parameter_name,
            crisp_value: result.crisp_value,
            fuzzified_inputs: result.fuzzified_inputs.into_iter().map(|f| f.into()).collect(),
            fired_rules_count: result.fired_rules_count,
        }
    }
}

/// Fuzzified input info DTO for debugging/display
#[derive(Debug, Clone, Serialize)]
pub struct FuzzifiedInputInfoDto {
    pub input_parameter_id: i64,
    pub input_parameter_name: String,
    pub crisp_value: f32,
    pub membership_degrees: Vec<MembershipDegreeDto>,
}

impl From<FuzzifiedInputInfo> for FuzzifiedInputInfoDto {
    fn from(info: FuzzifiedInputInfo) -> Self {
        Self {
            input_parameter_id: info.input_parameter_id,
            input_parameter_name: info.input_parameter_name,
            crisp_value: info.crisp_value,
            membership_degrees: info
                .membership_degrees
                .into_iter()
                .map(|(name, degree)| MembershipDegreeDto {
                    linguistic_term: name,
                    degree,
                })
                .collect(),
        }
    }
}

/// Membership degree DTO
#[derive(Debug, Clone, Serialize)]
pub struct MembershipDegreeDto {
    pub linguistic_term: String,
    pub degree: f32,
}
