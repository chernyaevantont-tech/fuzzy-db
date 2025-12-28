use tauri::State;

use crate::{
    application::use_cases::output_parameter::{
        create::CreateOutputParameterUseCase,
        remove_by_id::RemoveOutputParameterByIdUseCase,
        update_by_id::UpdateOutputParameterByIdUseCase,
    },
    infrastructure::{
        state::AppState,
        tauri::dtos::output_parameter_dtos::{
            CreateOutputParameterRequest, UpdateOutputParameterRequest,
        },
    },
};

#[tauri::command]
pub fn create_output_parameter(
    create_request: CreateOutputParameterRequest,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    let use_case = CreateOutputParameterUseCase::new(state.output_parameter_repository.as_ref());

    let id = use_case
        .execute(&create_request.to_entity())
        .map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn update_output_parameter_by_id(
    id: i64,
    update_request: UpdateOutputParameterRequest,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let use_case = UpdateOutputParameterByIdUseCase::new(state.output_parameter_repository.as_ref());
    use_case
        .execute(id, &update_request.to_entity())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_output_parameter_by_id(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let use_case = RemoveOutputParameterByIdUseCase::new(state.output_parameter_repository.as_ref());
    use_case.execute(id).map_err(|e| e.to_string())
}
