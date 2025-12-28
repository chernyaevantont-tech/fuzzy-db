use tauri::State;

use crate::{
    application::use_cases::fuzzy_inference::EvaluateFuzzySystemUseCase,
    infrastructure::{
        state::AppState,
        tauri::dtos::fuzzy_inference_dtos::{
            EvaluateFuzzySystemRequest, EvaluateFuzzySystemResponse,
        },
    },
};

/// Evaluates a fuzzy inference system with the given inputs
///
/// This command performs the full fuzzy inference cycle:
/// 1. Fuzzification - convert crisp inputs to membership degrees
/// 2. Rule Evaluation - evaluate all rules using min T-norm (AND)
/// 3. Aggregation - combine fired rules using max S-norm
/// 4. Defuzzification - convert aggregated output to crisp value
///
/// # Arguments
/// * `request` - The evaluation request containing problem ID, inputs, method, and resolution
/// * `state` - The application state containing repositories
///
/// # Returns
/// EvaluateFuzzySystemResponse containing crisp outputs and debug information
#[tauri::command]
pub fn evaluate_fuzzy_system(
    request: EvaluateFuzzySystemRequest,
    state: State<'_, AppState>,
) -> Result<EvaluateFuzzySystemResponse, String> {
    let use_case = EvaluateFuzzySystemUseCase::new(state.problem_repository.as_ref());

    let result = use_case
        .execute(
            request.problem_id,
            request.to_inputs(),
            request.get_method(),
            request.get_resolution(),
        )
        .map_err(|e| e.to_string())?;

    Ok(EvaluateFuzzySystemResponse::from(result))
}
