use tauri::State;

use crate::{
    application::use_cases::{
        problem::{
            create::CreateProblemUseCase, get_all_by_prev_problem_id::GetAllByPrevProblemIdUseCase,
            remove_by_id::RemoveByIdUseCase, update_by_id::UpdateByIdUseCase,
            get_full_by_id::GetFullByIdUseCase
        },
    },
    infrastructure::{
        state::AppState,
        tauri::dtos::problem_dtos::{
            CreateProblemRequest, ProblemCreateResponse, ProblemFullResponse, ProblemResponse,
            UpdateProblemRequest,
        },
    },
};

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
) -> Result<(), String> {
    let use_case = UpdateByIdUseCase::new(state.problem_repository.as_ref());
    use_case
        .execute(id, &update_request.to_entity())
        .map_err(|e| e.to_string())?;
    Ok(())
}
