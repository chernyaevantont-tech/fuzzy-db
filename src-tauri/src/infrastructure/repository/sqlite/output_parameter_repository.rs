use std::sync::{Arc, Mutex};

use rusqlite::{params, Connection};

use crate::domain::{
    entities::{fuzzy_output_value::FuzzyOutputValue, output_parameter::OutputParameter},
    error::DomainError,
    repository::OutputParameterRepository,
};

pub struct SqliteOutputParameterRepository {
    conn: Arc<Mutex<Connection>>,
}

impl SqliteOutputParameterRepository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn: conn }
    }
}

impl OutputParameterRepository for SqliteOutputParameterRepository {
    fn get_by_id(&self, id: i64) -> Result<OutputParameter, DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let model: OutputParameter = conn
            .query_row(
                "SELECT id, problem_id, name, start, end FROM output_parameter WHERE id = ?",
                params![id],
                |row| {
                    Ok(OutputParameter {
                        id: row.get(0)?,
                        problem_id: row.get(1)?,
                        name: row.get(2)?,
                        start: row.get(3)?,
                        end: row.get(4)?,
                        fuzzy_output_values: Vec::<FuzzyOutputValue>::new(),
                    })
                },
            )
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        Ok(model)
    }

    fn create(&self, problem_id: i64, model: &OutputParameter) -> Result<i64, DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let transaction = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let result = {
            let mut stmt = transaction
                .prepare("INSERT INTO output_parameter (problem_id, name) VALUES (?, ?)")
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            stmt.execute(rusqlite::params![&problem_id, &model.name,])
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let new_output_parameter_id = transaction.last_insert_rowid();

            let mut stmt = transaction
                .prepare("SELECT id FROM input_parameter WHERE problem_id = ? ORDER BY id")
                .map_err(|e| DomainError::Internal(e.to_string()))?;
            let mut input_parameter_rows = stmt
                .query(params![&problem_id])
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let mut input_parameter_ids = Vec::<i64>::new();
            while let Some(row) = input_parameter_rows
                .next()
                .map_err(|e| DomainError::Internal(e.to_string()))?
            {
                input_parameter_ids.push(
                    row.get(0)
                        .map_err(|e| DomainError::Internal(e.to_string()))?,
                );
            }

            let mut input_values_ids = Vec::<Vec<i64>>::new();

            for input_parametr_id in input_parameter_ids.iter() {
                input_values_ids.push(Vec::<i64>::new());
                let length = input_values_ids.len();
                let mut stmt = transaction
                    .prepare("SELECT id FROM input_value WHERE input_parameter_id = ? ORDER BY id")
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                let mut input_parameter_rows = stmt
                    .query(params![input_parametr_id])
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                while let Some(row) = input_parameter_rows
                    .next()
                    .map_err(|e| DomainError::Internal(e.to_string()))?
                {
                    input_values_ids[length - 1].push(
                        row.get(0)
                            .map_err(|e| DomainError::Internal(e.to_string()))?,
                    );
                }
            }

            if input_values_ids.len() != 0 {
                let input_values_ids = combinations(&input_values_ids);
                for input_values_ids_single_parameter in input_values_ids.iter() {
                    let input_values_ids_strings: Vec<_> = input_values_ids_single_parameter
                        .iter()
                        .map(|id| format!("|{}|", id))
                        .collect();
                    let mut stmt= transaction
                .prepare("INSERT INTO output_value (output_parameter_id, input_value_ids) VALUES (?, ?)").map_err(|e| DomainError::Internal(e.to_string()))?;
                    stmt.execute(rusqlite::params![
                        &new_output_parameter_id,
                        &input_values_ids_strings.join("")
                    ])
                    .map_err(|e| DomainError::Internal(e.to_string()))?;
                }
            }

            Ok(new_output_parameter_id)
        };
        fn combinations(v: &Vec<Vec<i64>>) -> Vec<Vec<i64>> {
            let mut result = vec![];
            let mut current_combination = vec![];

            fn _combinations(
                v: &Vec<Vec<i64>>,
                current_combination: &mut Vec<i64>,
                i: usize,
                result: &mut Vec<Vec<i64>>,
            ) {
                if i == v.len() {
                    let mut new_vec = vec![];
                    for j in 0..current_combination.len() {
                        new_vec.push(current_combination[j]);
                    }
                    result.push(new_vec);
                } else {
                    for j in 0..v[i].len() {
                        current_combination.push(v[i][j]);
                        _combinations(v, current_combination, i + 1, result);
                        current_combination.pop();
                    }
                }
            }

            _combinations(v, &mut current_combination, 0, &mut result);

            result
        }

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
        conn.execute("DELETE FROM output_parameter WHERE id = ?", &[&id])
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        Ok(())
    }

    fn update_by_id(&self, id: i64, model: &OutputParameter) -> Result<(), DomainError> {
        let conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let mut stmt = conn
            .prepare("UPDATE output_parameter SET name = ?, start = ?, end = ? WHERE id = ?")
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        stmt.execute(params![&model.name, &model.start, &model.end, &id,])
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        Ok(())
    }

    fn switch(&self, id_1: i64, id_2: i64) -> Result<(), DomainError> {
        let mut conn = self
            .conn
            .lock()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        let tx = conn
            .transaction()
            .map_err(|e| DomainError::Internal(e.to_string()))?;

        let name_1 = {
            let mut stmt = tx
                .prepare("SELECT name FROM output_parameter WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let name: String = stmt
                .query_row(params![id_1], |row| row.get(0))
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            name
        };

        let name_2 = {
            let mut stmt = tx
                .prepare("SELECT name FROM output_parameter WHERE id = ?")
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            let name: String = stmt
                .query_row(params![id_2], |row| row.get(0))
                .map_err(|e| DomainError::Internal(e.to_string()))?;

            name
        };

        tx.execute(
            "UPDATE output_parameter SET name = ? WHERE id = ?",
            params![name_2, id_1],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.execute(
            "UPDATE output_parameter SET name = ? WHERE id = ?",
            params![name_1, id_2],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.execute(
            "UPDATE output_value SET output_parameter_id = 
            CASE 
                WHEN output_parameter_id = ? THEN ? 
                WHEN output_parameter_id = ? THEN ? 
                ELSE output_parameter_id 
            END 
        WHERE output_parameter_id IN (?, ?)",
            params![id_1, id_2, id_2, id_1, id_1, id_2],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.execute(
            "UPDATE fuzzy_output_value SET output_parameter_id = 
            CASE 
                WHEN output_parameter_id = ? THEN ? 
                WHEN output_parameter_id = ? THEN ? 
                ELSE output_parameter_id 
            END 
        WHERE output_parameter_id IN (?, ?)",
            params![id_1, id_2, id_2, id_1, id_1, id_2],
        )
        .map_err(|e| DomainError::Internal(e.to_string()))?;

        tx.commit()
            .map_err(|e| DomainError::Internal(e.to_string()))?;
        Ok(())
    }
}
