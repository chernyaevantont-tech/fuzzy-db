use tauri::State;

use crate::{
    application::use_cases::{
        problem::{
            create::CreateProblemUseCase, export_problem::ExportProblemUseCase,
            get_all_by_prev_problem_id::GetAllByPrevProblemIdUseCase,
            get_full_by_id::GetFullByIdUseCase, import_problem::ImportProblemUseCase,
            remove_by_id::RemoveByIdUseCase, update_by_id::UpdateByIdUseCase,
        },
    },
    domain::entities::image::Image,
    infrastructure::{
        state::AppState,
        tauri::dtos::{
            export_import_dtos::ExportedProblem,
            problem_dtos::{
                CreateProblemRequest, ImageUpdateAction, ProblemCreateResponse, ProblemFullResponse,
                ProblemResponse, UpdateProblemRequest,
            },
        },
    },
};

#[tauri::command]
pub fn export_problem(id: i64, state: State<'_, AppState>) -> Result<ExportedProblem, String> {
    let use_case = ExportProblemUseCase::new(
        state.problem_repository.as_ref(),
        state.image_repository.as_ref(),
    );

    use_case.execute(id).map_err(|e: crate::domain::error::DomainError| e.to_string())
}

#[tauri::command]
pub fn import_problem(
    parent_id: Option<i64>,
    data: ExportedProblem,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let use_case = ImportProblemUseCase::new(
        state.problem_repository.as_ref(),
        state.input_parameter_repository.as_ref(),
        state.input_value_repository.as_ref(),
        state.output_parameter_repository.as_ref(),
        state.fuzzy_output_value_repository.as_ref(),
        state.output_value_repository.as_ref(),
    );

    use_case.execute(parent_id, data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_problems_by_prev_problem_id(
    prev_problem_id: Option<i64>,
    state: State<'_, AppState>,
) -> Result<Vec<ProblemResponse>, String> {
    let use_case = GetAllByPrevProblemIdUseCase::new(state.problem_repository.as_ref());

    let problems = use_case
        .execute(prev_problem_id)
        .map_err(|e| e.to_string())?;
    Ok(problems.iter().map(|x| ProblemResponse::from(x)).collect())
}

#[tauri::command]
pub fn get_full_problem_by_id(
    id: i64,
    state: State<'_, AppState>,
) -> Result<ProblemFullResponse, String> {
    let use_case = GetFullByIdUseCase::new(state.problem_repository.as_ref());

    let problem = use_case.execute(id).map_err(|e| e.to_string())?;
    Ok(ProblemFullResponse::from(&problem))
}

#[tauri::command]
pub fn create_problem(
    create_request: CreateProblemRequest,
    state: State<'_, AppState>,
) -> Result<ProblemCreateResponse, String> {
    let use_case = CreateProblemUseCase::new(state.problem_repository.as_ref());
    let (id, image_id) = use_case
        .execute(&create_request.to_entity())
        .map_err(|e| e.to_string())?;
    Ok(ProblemCreateResponse {
        id: id,
        image_id: image_id,
    })
}

#[tauri::command]
pub fn remove_problem_by_id(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let use_case = RemoveByIdUseCase::new(state.problem_repository.as_ref());
    use_case.execute(id).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_problem_by_id(
    id: i64,
    update_request: UpdateProblemRequest,
    state: State<'_, AppState>,
) -> Result<Option<i64>, String> {
    let use_case = UpdateByIdUseCase::new(state.problem_repository.as_ref());

    let (delete_image, new_image) = match &update_request.image_update {
        ImageUpdateAction::NoChange => (false, None),
        ImageUpdateAction::Delete => (true, None),
        ImageUpdateAction::Set(img) => (
            true,
            Some(Image {
                id: 0,
                image_data: img.image_data.clone(),
                image_format: img.image_format.clone(),
            }),
        ),
    };

    let image_id = use_case
        .execute(id, &update_request.to_entity(), delete_image, new_image)
        .map_err(|e| e.to_string())?;
    Ok(image_id)
}
