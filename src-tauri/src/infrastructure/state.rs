use std::{
    env,
    sync::{Arc, Mutex},
};

use crate::{
    domain::repository::{ImageRepository, InputParameterRepository, InputValueRepository, ProblemRepository},
    infrastructure::repository::sqlite::{
        image_repository::SqliteImageRepository, input_parameter_repository::SqliteInputParameterRepository, input_value_repository::SqliteInputValueRepository, problem_repository::SqliteProblemRepository
    },
};

pub struct AppState {
    pub problem_repository: Box<dyn ProblemRepository>,
    pub input_parameter_repository: Box<dyn InputParameterRepository>,
    pub input_value_repository: Box<dyn InputValueRepository>,
    pub image_repository: Box<dyn ImageRepository>,
}

impl AppState {
    pub fn new() -> Self {
        let current_exe_path = env::current_exe().expect("Failed to get current executable path");
        let exe_dir = current_exe_path
            .parent()
            .expect("Failed to get parent directory of executable");
        let dir_path = exe_dir.join("main.db").to_str().unwrap().to_string();
        let conn = rusqlite::Connection::open(dir_path).expect("Failed to open database");

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS image (
                id INTEGER PRIMARY KEY,
                image_data BLOB NOT NULL,
                image_format VARCHAR(255) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS problem (
                id INTEGER PRIMARY KEY,
                prev_problem_id INTEGER REFERENCES problem(id),
                is_final BOOLEAN NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                image_id INTEGER REFERENCES image(id),
                created_at VARCHAR(255) NOT NULL,
                updated_at VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS input_parameter (
                id INTEGER PRIMARY KEY,
                problem_id INTEGER NOT NULL REFERENCES problem(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                start REAL NOT NULL DEFAULT(0),
                end REAL NOT NULL DEFAULT(1)
            );

            CREATE TABLE IF NOT EXISTS input_value (
                id INTEGER PRIMARY KEY,
                input_parameter_id INTEGER NOT NULL REFERENCES input_parameter(id) ON DELETE CASCADE,
                value VARCHAR(255) NOT NULL,
                a REAL NOT NULL,
                b REAL NOT NULL,
                c REAL NOT NULL,
                d REAL NOT NULL,
                is_triangle BOOLEAN NOT NULL DEFAULT(false)
            );

            CREATE TABLE IF NOT EXISTS output_parameter (
                id INTEGER PRIMARY KEY,
                problem_id INTEGER NOT NULL REFERENCES problem(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                start REAL NOT NULL DEFAULT(0),
                end REAL NOT NULL DEFAULT(1) 
            );

            CREATE TABLE IF NOT EXISTS fuzzy_output_value (
                id INTEGER PRIMARY KEY,
                output_parameter_id INTEGER NOT NULL REFERENCES output_parameter(id) ON DELETE CASCADE,
                value VARCHAR(255) NOT NULL,
                a REAL NOT NULL,
                b REAL NOT NULL,
                c REAL NOT NULL,
                d REAL NOT NULL,
                is_triangle BOOLEAN NOT NULL DEFAULT(false)
            );

            CREATE TABLE IF NOT EXISTS output_value (
                id INTEGER PRIMARY KEY,
                output_parameter_id INTEGER NOT NULL REFERENCES output_parameter(id) ON DELETE CASCADE,
                fuzzy_output_value_id INTEGER REFERENCES fuzzy_output_value(id) ON DELETE SET NULL,
                input_value_ids TEXT NOT NULL
            );
        ",
        )
        .unwrap();

        let shared_conn = Arc::new(Mutex::new(conn));

        Self {
            problem_repository: Box::new(SqliteProblemRepository::new(Arc::clone(&shared_conn))),
            input_parameter_repository: Box::new(SqliteInputParameterRepository::new(Arc::clone(&shared_conn))),
            input_value_repository: Box::new(SqliteInputValueRepository::new(Arc::clone(&shared_conn))),
            image_repository: Box::new(SqliteImageRepository::new(Arc::clone(&shared_conn))),
        }
    }
}
