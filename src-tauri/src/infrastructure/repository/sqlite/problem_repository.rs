use std::sync::{Arc, Mutex};

use chrono::Utc;
use rusqlite::{params, Connection, ErrorCode};

use crate::domain::entities::fuzzy_output_value::FuzzyOutputValue;
use crate::domain::entities::input_parameter::InputParameter;
use crate::domain::entities::input_value::InputValue;
use crate::domain::entities::output_parameter::OutputParameter;
use crate::domain::entities::output_value::OutputValue;
use crate::domain::entities::problem::Problem;
use crate::domain::error::DomainError;
use crate::domain::repository::ProblemRepository;

pub struct SqliteProblemRepository {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteProblemRepository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn: conn }
    }

    fn get_all_input_values_by_input_parameter_id(
        &self,
        input_parameter: &mut InputParameter,
        conn: &Connection,
    ) -> Result<(), DomainError> {
        let mut stmt = conn.prepare("SELECT id, input_parameter_id, value, a, b, c, d, is_triangle FROM input_value WHERE input_parameter_id = ? ORDER BY a ASC").map_err(|e|  DomainError::Internal(e.to_string()))?;
        let result = stmt
            .query_map(params![input_parameter.id], |row| {
                Ok(InputValue {
                    id: row.get(0)?,
                    input_parameter_id: row.get(1)?,
                    value: row.get(2)?,
                    a: row.get(3)?,
                    b: row.get(4)?,
                    c: row.get(5)?,
                    d: row.get(6)?,
                    is_triangle: row.get(7)?,
                })
            })
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let input_values_result: Vec<_> = result.collect();
        for input_value_result in input_values_result {
            match input_value_result {
                Ok(input_value) => input_parameter.input_values.push(input_value),
                Err(error) => return Err(DomainError::Internal(error.to_string())),
            }
        }
        Ok(())
    }

    fn get_all_fuzzy_output_values_by_output_parameter_id(
        &self,
        output_parameter: &mut OutputParameter,
        conn: &Connection,
    ) -> Result<(), DomainError> {
        let mut stmt = conn.prepare("SELECT id, output_parameter_id, value, a, b, c, d, is_triangle FROM fuzzy_output_value WHERE output_parameter_id = ? ORDER BY a ASC").map_err(|e|  DomainError::Internal(e.to_string()))?;
        let result = stmt
            .query_map(params![output_parameter.id], |row| {
                Ok(FuzzyOutputValue {
                    id: row.get(0)?,
                    output_parameter_id: row.get(1)?,
                    value: row.get(2)?,
                    a: row.get(3)?,
                    b: row.get(4)?,
                    c: row.get(5)?,
                    d: row.get(6)?,
                    is_triangle: row.get(7)?,
                })
            })
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let output_values_result: Vec<_> = result.collect();
        for output_value_result in output_values_result {
            match output_value_result {
                Ok(output_value) => output_parameter.fuzzy_output_values.push(output_value),
                Err(error) => return Err(DomainError::Internal(error.to_string())),
            }
        }
        Ok(())
    }

    fn deep_delete(&self, id: i64, conn: &Connection) -> Result<(), DomainError> {
        let mut stmt = conn
            .prepare("SELECT id FROM problem WHERE prev_problem_id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let ids_result = stmt
            .query_map(rusqlite::params![&id], |row| {
                return Ok(row.get(0)?);
            })
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let ids_result: Vec<_> = ids_result.collect();
        let mut problem_ids = Vec::<i64>::new();
        for id_result in ids_result {
            match id_result {
                Ok(id) => problem_ids.push(id),
                Err(error) => {
                    return Err(DomainError::Internal(error.to_string()));
                }
            }
        }

        for child_id in problem_ids {
            self.deep_delete(child_id, conn)?;
        }

        let mut stmt = conn
            .prepare("SELECT image_id FROM problem WHERE id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let image_id: Option<i64> = stmt
            .query_row(params![id], |row| row.get(0))
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        if let Some(image_id) = image_id {
            conn.execute("DELETE FROM image WHERE id = ?", params![image_id])
                .map_err(|e| DomainError::Internal(e.to_string()))?;
        }

        conn.execute("DELETE FROM problem WHERE id = ?", &[&id])
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(())
    }
}

impl ProblemRepository for SqliteProblemRepository {
    fn get_all_by_prev_problem_id(&self, id: Option<i64>) -> Result<Vec<Problem>, DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let problems_result: Vec<_>;

        if let Some(id) = id {
            let mut stmt = conn.prepare("SELECT id, prev_problem_id, is_final, name, description, created_at, updated_at, image_id FROM problem WHERE prev_problem_id = ?").map_err(|e|  DomainError::Internal(e.to_string()))?;

            let result = stmt
                .query_map(params![id], |row| {
                    Ok(Problem {
                        id: row.get(0)?,
                        prev_problem_id: row.get(1)?,
                        is_final: row.get(2)?,
                        name: row.get(3)?,
                        description: row.get(4)?,
                        created_at: row.get(5)?,
                        updated_at: row.get(6)?,
                        image_id: row.get(7)?,
                        input_parameters: Vec::<InputParameter>::new(),
                        output_parameters: Vec::<OutputParameter>::new(),
                        output_values: Vec::<OutputValue>::new(),
                        image: None,
                    })
                })
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            problems_result = result.collect();
        } else {
            let mut stmt = conn.prepare("SELECT id, prev_problem_id, is_final, name, description, created_at, updated_at, image_id FROM problem WHERE prev_problem_id IS NULL").map_err(|e|  DomainError::Internal(e.to_string()))?;

            let result = stmt
                .query_map(params![], |row| {
                    Ok(Problem {
                        id: row.get(0)?,
                        prev_problem_id: row.get(1)?,
                        is_final: row.get(2)?,
                        name: row.get(3)?,
                        description: row.get(4)?,
                        created_at: row.get(5)?,
                        updated_at: row.get(6)?,
                        image_id: row.get(7)?,
                        input_parameters: Vec::<InputParameter>::new(),
                        output_parameters: Vec::<OutputParameter>::new(),
                        output_values: Vec::<OutputValue>::new(),
                        image: None,
                    })
                })
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            problems_result = result.collect();
        }

        let mut problems = Vec::<Problem>::new();
        for problem_result in problems_result {
            match problem_result {
                Ok(problem) => problems.push(problem),
                Err(error) => return Err(DomainError::Internal(error.to_string())),
            }
        }

        Ok(problems)
    }

    fn get_full_by_id(&self, id: i64) -> Result<Problem, DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("SELECT id, prev_problem_id, is_final, name, description, created_at, updated_at, image_id FROM problem WHERE id = ?").map_err(|e|  DomainError::Internal(e.to_string()))?;
        let mut problem = stmt
            .query_row(params![id], |row| {
                Ok(Problem {
                    id: row.get(0)?,
                    prev_problem_id: row.get(1)?,
                    is_final: row.get(2)?,
                    name: row.get(3)?,
                    description: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                    image_id: row.get(7)?,
                    input_parameters: Vec::<InputParameter>::new(),
                    output_parameters: Vec::<OutputParameter>::new(),
                    output_values: Vec::<OutputValue>::new(),
                    image: None,
                })
            })
            .map_err(|e| match e.sqlite_error_code() {
                None => DomainError::Internal(e.to_string()),
                Some(error_code) => match error_code {
                    ErrorCode::NotFound => DomainError::NotFound(e.to_string()),
                    _ => DomainError::Internal(e.to_string()),
                },
            })?;

        let mut stmt = conn
            .prepare(
                "SELECT id, problem_id, name, start, end FROM input_parameter WHERE problem_id = ?",
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let result = stmt
            .query_map(params![id], |row| {
                Ok(InputParameter {
                    id: row.get(0)?,
                    problem_id: row.get(1)?,
                    name: row.get(2)?,
                    start: row.get(3)?,
                    end: row.get(4)?,
                    input_values: Vec::<InputValue>::new(),
                })
            })
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let input_parameters_result: Vec<_> = result.collect();
        for input_parameter_result in input_parameters_result {
            match input_parameter_result {
                Ok(mut input_parameter) => {
                    self.get_all_input_values_by_input_parameter_id(&mut input_parameter, &conn)
                        .map_err(|e| DomainError::Internal(e.to_string()))?;
                    problem.input_parameters.push(input_parameter);
                }
                Err(error) => return Err(DomainError::Internal(error.to_string())),
            }
        }

        let mut stmt = conn
            .prepare(
                "SELECT id, problem_id, name, start, end FROM output_parameter WHERE problem_id = ?",
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let result = stmt
            .query_map(params![id], |row| {
                Ok(OutputParameter {
                    id: row.get(0)?,
                    problem_id: row.get(1)?,
                    name: row.get(2)?,
                    start: row.get(3)?,
                    end: row.get(4)?,
                    fuzzy_output_values: Vec::<FuzzyOutputValue>::new(),
                })
            })
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let output_parameters_result: Vec<_> = result.collect();
        for output_parameter_result in output_parameters_result {
            match output_parameter_result {
                Ok(mut output_parameter) => {
                    self.get_all_fuzzy_output_values_by_output_parameter_id(
                        &mut output_parameter,
                        &conn,
                    )
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                    problem.output_parameters.push(output_parameter);
                }
                Err(error) => return Err(DomainError::Internal(error.to_string())),
            }
        }

        let mut stmt = conn
            .prepare(
                "SELECT output_value.id, output_value.output_parameter_id, output_value.input_value_ids, output_value.fuzzy_output_value_id 
                FROM output_value 
                LEFT JOIN output_parameter ON output_value.output_parameter_id = output_parameter.id 
                WHERE output_parameter.problem_id = ?",
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let result = stmt
            .query_map(params![id], |row| {
                Ok(OutputValue {
                    id: row.get(0)?,
                    output_parameter_id: row.get(1)?,
                    input_value_ids: row.get(2)?,
                    fuzzy_output_value_id: row.get(3)?,
                })
            })
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let output_values_result: Vec<_> = result.collect();
        for output_value_result in output_values_result {
            match output_value_result {
                Ok(output_value) => {
                    problem.output_values.push(output_value);
                }
                Err(error) => return Err(DomainError::Internal(error.to_string())),
            }
        }

        Ok(problem)
    }

    fn create(&self, model: &Problem) -> Result<(i64, Option<i64>), DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let transaction = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let result: Result<(i64, Option<i64>), DomainError> = {
            let mut image_id = Option::<i64>::None;

            if let Some(image) = &model.image {
                let mut stmt = transaction
                    .prepare("INSERT INTO image (image_data, image_format) VALUES (?, ?)")
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                stmt.execute(params![&image.image_data, &image.image_format])
                    .map_err(|e| DomainError::Internal(e.to_string()))?;

                image_id = Some(transaction.last_insert_rowid());
            }

            let mut stmt = transaction
                .prepare(
                    "INSERT INTO problem
            (prev_problem_id, is_final, name, description, created_at, image_id)
            VALUES (?, ?, ?, ?, ?, ?)",
                )
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let time = Utc::now().to_rfc3339();

            stmt.execute(params![
                &model.prev_problem_id,
                &(|x: bool| -> i8 {
                    if x {
                        return 1;
                    } else {
                        return 0;
                    }
                })(model.is_final),
                &model.name,
                &model.description,
                &time,
                &image_id,
            ])
            .map_err(|e| DomainError::Internal(e.to_string()))?;
            let new_id = transaction.last_insert_rowid();

            Ok((new_id, image_id))
        };

        match result {
            Ok(id) => {
                transaction
                    .commit()
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                Ok(id)
            }
            Err(e) => {
                transaction
                    .rollback()
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                Err(e)
            }
        }
    }

    fn remove_by_id(&self, id: i64) -> Result<(), DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        self.deep_delete(id, &conn)
    }

    fn update_by_id(&self, id: i64, model: &Problem) -> Result<(), DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn.prepare("UPDATE problem SET is_final = ?, name = ?, description = ?, image_id = ?, updated_id = ? WHERE id = ?")
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        let time = Utc::now().to_rfc3339();

        stmt.execute(params![
            &model.is_final,
            &model.name,
            &model.description,
            &model.image_id,
            &time,
            &id,
        ])
        .map_err(|e| match e.sqlite_error_code() {
            None => DomainError::Internal(e.to_string()),
            Some(error_code) => match error_code {
                ErrorCode::NotFound => DomainError::NotFound(e.to_string()),
                _ => DomainError::Internal(e.to_string()),
            },
        })?;

        Ok(())
    }

    fn is_final(&self, id: i64) -> Result<bool, DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("SELECT EXISTS(SELECT is_final FROM problem WHERE id = ?)")
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let exists: bool = stmt.query_row(params![id], |row| row.get(0)).map_err(|e| {
            match e.sqlite_error_code() {
                None => DomainError::Internal(e.to_string()),
                Some(error_code) => match error_code {
                    ErrorCode::NotFound => DomainError::NotFound(e.to_string()),
                    _ => DomainError::Internal(e.to_string()),
                },
            }
        })?;
        Ok(exists)
    }
}
