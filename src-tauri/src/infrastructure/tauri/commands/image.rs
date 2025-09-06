use tauri::State;

use crate::{application::use_cases::image::get_by_id::GetByIdUseCase, infrastructure::{state::AppState, tauri::dtos::image_dtos::ImageResponse}};

#[tauri::command]
pub fn get_image_by_id(
    id: i64,
    state: State<'_, AppState>
) -> Result<ImageResponse, String>{
    let use_case = GetByIdUseCase::new(state.image_repository.as_ref());

    let image = use_case.execute(id).map_err(|e| e.to_string())?;
    Ok(ImageResponse::from(image))
}