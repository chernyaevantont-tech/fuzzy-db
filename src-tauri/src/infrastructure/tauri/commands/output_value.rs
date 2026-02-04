use tauri::State;

use crate::{
    application::use_cases::output_value::{
        create::CreateOutputValueUseCase, 
        get_by_problem_id::GetOutputValuesByProblemIdUseCase,
        update_by_id::UpdateOutputValueByIdUseCase
    },
    domain::entities::output_value::OutputValue,
    infrastructure::{state::AppState, tauri::dtos::output_value_dtos::{OutputValueResponse, UpdateOutputValueRequest}},
};

#[tauri::command]
pub async fn create_output_value(
    output_parameter_id: i64,
    input_value_ids: String,
    state: State<'_, AppState>,
) -> Result<OutputValueResponse, String> {
    let use_case = CreateOutputValueUseCase::new(
        state.output_value_repository.as_ref(),
    );

    let new_output_value = OutputValue {
        id: 0,
        output_parameter_id,
        fuzzy_output_value_id: None,
        input_value_ids,
    };

    let id = use_case
        .execute(&new_output_value)
        .map_err(|e| e.to_string())?;

    let response = OutputValueResponse {
        id,
        output_parameter_id,
        fuzzy_output_value_id: None,
        input_value_ids: new_output_value.input_value_ids,
    };

    Ok(response)
}

#[tauri::command]
pub async fn update_output_value_by_id(
    id: i64,
    request: UpdateOutputValueRequest,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let use_case = UpdateOutputValueByIdUseCase::new(state.output_value_repository.as_ref());
    use_case
        .execute(id, request.fuzzy_output_value_id)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_output_values_by_problem_id(
    problem_id: i64,
    state: State<'_, AppState>,
) -> Result<Vec<OutputValueResponse>, String> {
    let use_case = GetOutputValuesByProblemIdUseCase::new(
        state.output_value_repository.as_ref(),
    );

    let output_values = use_case
        .execute(problem_id)
        .map_err(|e| e.to_string())?;

    let response: Vec<OutputValueResponse> = output_values
        .into_iter()
        .map(|ov| OutputValueResponse {
            id: ov.id,
            output_parameter_id: ov.output_parameter_id,
            fuzzy_output_value_id: ov.fuzzy_output_value_id,
            input_value_ids: ov.input_value_ids,
        })
        .collect();

    Ok(response)
}
