use tauri::State;

use crate::{
    application::use_cases::input_parameter::{
        create::CreateInputParameterUseCase, remove_by_id::RemoveInputParameterByIdUseCase, update_by_id::UpdateInputParameterByIdUseCase
    },
    infrastructure::{
        state::AppState,
        tauri::dtos::input_parameter_dtos::{
            CreateInputParameterRequest, UpdateInputParameterRequest,
        },
    },
};

#[tauri::command]
pub fn create_input_parameter(
    create_request: CreateInputParameterRequest,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    let use_case = CreateInputParameterUseCase::new(state.input_parameter_repository.as_ref());

    let id = use_case
        .execute(&create_request.to_entity())
        .map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn update_input_parameter_by_id(
    id: i64,
    update_request: UpdateInputParameterRequest,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let use_case = UpdateInputParameterByIdUseCase::new(state.input_parameter_repository.as_ref());
    use_case
        .execute(id, &update_request.to_entity())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_input_parameter_by_id(
    id: i64,
    state: State<'_, AppState>
) -> Result<(), String> {
    let use_case = RemoveInputParameterByIdUseCase::new(state.input_parameter_repository.as_ref());
    use_case
        .execute(id)
        .map_err(|e| e.to_string())
}