use tauri::State;

use crate::{
    application::use_cases::input_value::{
        create::CreateInputValueUseCase,
        remove_by_id::RemoveInputValueByIdUseCase,
        update_by_id::UpdateInputValueByIdUseCase,
    },
    infrastructure::{
        state::AppState,
        tauri::dtos::input_value_dtos::{CreateInputValueRequest, UpdateInputValueRequest},
    },
};

#[tauri::command]
pub fn create_input_value(
    create_request: CreateInputValueRequest,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    let use_case = CreateInputValueUseCase::new(state.input_value_repository.as_ref());

    use_case
        .execute(&create_request.to_entity())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_input_value_by_id(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let use_case = RemoveInputValueByIdUseCase::new(state.input_value_repository.as_ref());

    use_case.execute(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_input_value_by_id(
    id: i64,
    update_request: UpdateInputValueRequest,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let use_case = UpdateInputValueByIdUseCase::new(state.input_value_repository.as_ref());

    use_case
        .execute(id, &update_request.to_entity())
        .map_err(|e| e.to_string())
}
