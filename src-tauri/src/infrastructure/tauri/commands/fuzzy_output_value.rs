use tauri::State;

use crate::{
    application::use_cases::fuzzy_output_value::{
        create::CreateFuzzyOutputValueUseCase,
        remove_by_id::RemoveFuzzyOutputValueByIdUseCase,
        update_by_id::UpdateFuzzyOutputValueByIdUseCase,
    },
    infrastructure::{
        state::AppState,
        tauri::dtos::fuzzy_output_value_dtos::{
            CreateFuzzyOutputValueRequest, UpdateFuzzyOutputValueRequest,
        },
    },
};

#[tauri::command]
pub fn create_fuzzy_output_value(
    create_request: CreateFuzzyOutputValueRequest,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    let use_case = CreateFuzzyOutputValueUseCase::new(state.fuzzy_output_value_repository.as_ref());

    let id = use_case
        .execute(&create_request.to_entity())
        .map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn update_fuzzy_output_value_by_id(
    id: i64,
    update_request: UpdateFuzzyOutputValueRequest,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let use_case = UpdateFuzzyOutputValueByIdUseCase::new(state.fuzzy_output_value_repository.as_ref());
    use_case
        .execute(id, &update_request.to_entity())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_fuzzy_output_value_by_id(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let use_case = RemoveFuzzyOutputValueByIdUseCase::new(state.fuzzy_output_value_repository.as_ref());
    use_case.execute(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn switch_fuzzy_output_values(id1: i64, id2: i64, state: State<'_, AppState>) -> Result<(), String> {
    let repository = state.fuzzy_output_value_repository.as_ref();
    repository.switch(id1, id2).map_err(|e| e.to_string())
}
