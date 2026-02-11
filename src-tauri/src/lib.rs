// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod application;
pub mod domain;
pub mod infrastructure;

use infrastructure::state::AppState;
use infrastructure::tauri::commands::{
    fuzzy_inference::*, fuzzy_output_value::*, image::*, input_parameter::*, input_value::*,
    output_parameter::*, output_value::*, problem::*,
};

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
            export_problem,
            import_problem,
            get_all_problems_by_prev_problem_id,
            remove_problem_by_id,
            update_problem_by_id,
            get_image_by_id,
            get_full_problem_by_id,
            create_input_parameter,
            remove_input_parameter_by_id,
            update_input_parameter_by_id,
            switch_input_parameters,
            create_input_value,
            remove_input_value_by_id,
            update_input_value_by_id,
            switch_input_values,
            create_output_parameter,
            remove_output_parameter_by_id,
            update_output_parameter_by_id,
            switch_output_parameters,
            create_fuzzy_output_value,
            remove_fuzzy_output_value_by_id,
            update_fuzzy_output_value_by_id,
            switch_fuzzy_output_values,
            create_output_value,
            update_output_value_by_id,
            get_output_values_by_problem_id,
            evaluate_fuzzy_system,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
