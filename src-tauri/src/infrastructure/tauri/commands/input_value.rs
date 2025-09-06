use tauri::State;

use crate::{
    application::use_cases::input_value::create::CreateInputValueUseCase,
    infrastructure::{state::AppState, tauri::dtos::input_value_dtos::CreateInputValueRequest},
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
