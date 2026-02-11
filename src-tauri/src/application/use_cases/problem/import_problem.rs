use std::collections::HashMap;

use crate::domain::{
    entities::{
        fuzzy_output_value::FuzzyOutputValue, image::Image, input_parameter::InputParameter,
        input_value::InputValue, output_parameter::OutputParameter, output_value::OutputValue,
        problem::Problem,
    },
    error::DomainError,
    repository::{
        FuzzyOutputValueRepository, InputParameterRepository, InputValueRepository,
        OutputParameterRepository, OutputValueRepository, ProblemRepository,
    },
};
use crate::infrastructure::tauri::dtos::export_import_dtos::*;

pub struct ImportProblemUseCase<'a> {
    problem_repo: &'a dyn ProblemRepository,
    input_param_repo: &'a dyn InputParameterRepository,
    input_value_repo: &'a dyn InputValueRepository,
    output_param_repo: &'a dyn OutputParameterRepository,
    fuzzy_output_value_repo: &'a dyn FuzzyOutputValueRepository,
    output_value_repo: &'a dyn OutputValueRepository,
}

impl<'a> ImportProblemUseCase<'a> {
    pub fn new(
        problem_repo: &'a dyn ProblemRepository,
        input_param_repo: &'a dyn InputParameterRepository,
        input_value_repo: &'a dyn InputValueRepository,
        output_param_repo: &'a dyn OutputParameterRepository,
        fuzzy_output_value_repo: &'a dyn FuzzyOutputValueRepository,
        output_value_repo: &'a dyn OutputValueRepository,
    ) -> Self {
        Self {
            problem_repo,
            input_param_repo,
            input_value_repo,
            output_param_repo,
            fuzzy_output_value_repo,
            output_value_repo,
        }
    }

    pub fn execute(
        &self,
        parent_id: Option<i64>,
        dto: ExportedProblem,
    ) -> Result<(), DomainError> {
        let mut map_input_values = HashMap::new();
        let mut map_output_params = HashMap::new();
        let mut map_fuzzy_values = HashMap::new();
        
        self.import_internal(
            parent_id, 
            dto, 
            &mut map_input_values, 
            &mut map_output_params, 
            &mut map_fuzzy_values
        )
    }

    fn import_internal(
        &self,
        parent_id: Option<i64>,
        dto: ExportedProblem,
        map_input_values: &mut HashMap<i64, i64>,
        map_output_params: &mut HashMap<i64, i64>,
        map_fuzzy_values: &mut HashMap<i64, i64>,
    ) -> Result<(), DomainError> {
        // 1. Create Problem
        // Model for create
        let image = if let Some(img_dto) = dto.image {
            Some(Image {
                id: 0, // Ignored by create
                image_data: img_dto.data,
                image_format: img_dto.format,
            })
        } else {
            None
        };

        let problem_model = Problem {
            id: 0,
            prev_problem_id: parent_id,
            is_final: dto.is_final,
            name: dto.name,
            description: dto.description,
            image_id: None, // Logic handles it
            created_at: "".to_string(), // handled
            updated_at: None,
            input_parameters: vec![],
            output_parameters: vec![],
            output_values: vec![],
            image: image,
        };

        let (new_problem_id, _new_image_id) = self.problem_repo.create(&problem_model)?;

        // Maps are passed in arguments

        // 2. Input Params
        for ip in dto.input_parameters {
            let p_model = InputParameter {
                id: 0,
                problem_id: new_problem_id,
                name: ip.name,
                start: ip.start,
                end: ip.end,
                input_values: vec![],
            };
            let new_ip_id = self
                .input_param_repo
                .create_raw(new_problem_id, &p_model)?;

            for iv in ip.values {
                let v_model = InputValue {
                    id: 0,
                    input_parameter_id: new_ip_id,
                    value: iv.value,
                    a: iv.a,
                    b: iv.b,
                    c: iv.c,
                    d: iv.d,
                    is_triangle: iv.is_triangle,
                };
                let new_iv_id = self.input_value_repo.create_raw(&v_model)?;
                map_input_values.insert(iv.temp_id, new_iv_id);
            }
        }

        // 3. Output Params
        for op in dto.output_parameters {
             let p_model = OutputParameter {
                id: 0,
                problem_id: new_problem_id,
                name: op.name,
                start: op.start,
                end: op.end,
                fuzzy_output_values: vec![],
            };
            let new_op_id = self
                .output_param_repo
                .create_raw(new_problem_id, &p_model)?;
            
            map_output_params.insert(op.temp_id, new_op_id);

            for fov in op.values {
                let v_model = FuzzyOutputValue {
                    id: 0,
                    output_parameter_id: new_op_id,
                    value: fov.value,
                    a: fov.a,
                    b: fov.b,
                    c: fov.c,
                    d: fov.d,
                    is_triangle: fov.is_triangle,
                };
                let new_fov_id = self.fuzzy_output_value_repo.create_raw(&v_model)?;
                map_fuzzy_values.insert(fov.temp_id, new_fov_id);
            }
        }

        // 4. Output Values (Rules)
        for ov in dto.output_values {
            // Reconstruct IDs
            let new_op_id = *map_output_params.get(&ov.output_parameter_temp_id)
                .ok_or(DomainError::Validation("Output Param ID mismatch in export".to_string()))?;

            let new_fov_id = if let Some(fid) = ov.fuzzy_output_value_temp_id {
                 Some(*map_fuzzy_values.get(&fid)
                 .ok_or(DomainError::Validation("Fuzzy Value ID mismatch in export".to_string()))?)
            } else { None };

            let new_input_ids: Vec<String> = ov.input_value_temp_ids.iter().map(|old_id| {
                 map_input_values.get(old_id)
                    .map(|id| id.to_string())
                    .ok_or(DomainError::Validation("Input Value ID mismatch in export".to_string()))
            }).collect::<Result<Vec<String>, DomainError>>()?;

            // Sort IDs numerically before stringifying to match frontend hash generation
            let mut sorted_new_ids: Vec<i64> = new_input_ids
                .iter()
                .filter_map(|s| s.parse::<i64>().ok())
                .collect();
            sorted_new_ids.sort();

            let mut input_value_ids_string = String::new();
            for id in sorted_new_ids {
                input_value_ids_string.push_str(&format!("|{}|", id));
            }
            
            let model = OutputValue {
                id: 0,
                output_parameter_id: new_op_id,
                fuzzy_output_value_id: new_fov_id,
                input_value_ids: input_value_ids_string,
            };

            self.output_value_repo.create(&model)?;
        }

        // 5. Recursion for children
        for child in dto.children {
            self.import_internal(
                Some(new_problem_id), 
                child, 
                map_input_values, 
                map_output_params, 
                map_fuzzy_values
            )?;
        }

        Ok(())
    }
}
