// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod application;
pub mod domain;
pub mod infrastructure;

use infrastructure::state::AppState;
use infrastructure::tauri::commands::{problem::*, input_value::*, image::*, input_parameter::*};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = AppState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_problem,
            get_all_problems_by_prev_problem_id,
            remove_problem_by_id,
            get_image_by_id,
            get_full_problem_by_id,
            create_input_parameter,
            remove_input_parameter_by_id,
            update_input_parameter_by_id,
            create_input_value,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
