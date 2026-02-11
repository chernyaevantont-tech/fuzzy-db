use crate::domain::{
    error::DomainError,
    repository::{
        ImageRepository, ProblemRepository,
    },
};
use crate::infrastructure::tauri::dtos::export_import_dtos::*;

pub struct ExportProblemUseCase<'a> {
    problem_repo: &'a dyn ProblemRepository,
    image_repo: &'a dyn ImageRepository,
}

impl<'a> ExportProblemUseCase<'a> {
    pub fn new(
        problem_repo: &'a dyn ProblemRepository,
        image_repo: &'a dyn ImageRepository,
    ) -> Self {
        Self {
            problem_repo,
            image_repo,
        }
    }

    pub fn execute(&self, id: i64) -> Result<ExportedProblem, DomainError> {
        self.export_recursive(id)
    }

    fn export_recursive(&self, id: i64) -> Result<ExportedProblem, DomainError> {
        let p = self.problem_repo.get_full_by_id(id)?;

        // Recursive children
        let children_entities = self
            .problem_repo
            .get_all_by_prev_problem_id(Some(id))
            .unwrap_or(vec![]);
        
        let mut children_dtos = Vec::new();
        for child in children_entities {
            children_dtos.push(self.export_recursive(child.id)?);
        }

        // Image
        // If p.image is populated, use it. If not, try by image_id
        let image_dto = if let Some(img_ref) = &p.image {
             Some(ExportedImage {
                 data: img_ref.image_data.clone(),
                 format: img_ref.image_format.clone(),
             })
        } else if let Some(img_id) = p.image_id {
            if let Ok(img) = self.image_repo.get_by_id(img_id) {
                Some(ExportedImage {
                    data: img.image_data,
                    format: img.image_format,
                })
            } else {
                None
            }
        } else {
            None
        };

        // Inputs
        let inputs = p
            .input_parameters
            .iter()
            .map(|ip| ExportedInputParameter {
                temp_id: ip.id,
                name: ip.name.clone(),
                start: ip.start,
                end: ip.end,
                values: ip
                    .input_values
                    .iter()
                    .map(|iv| ExportedInputValue {
                        temp_id: iv.id,
                        value: iv.value.clone(),
                        a: iv.a,
                        b: iv.b,
                        c: iv.c,
                        d: iv.d,
                        is_triangle: iv.is_triangle,
                    })
                    .collect(),
            })
            .collect();

        // Outputs
        let outputs = p
            .output_parameters
            .iter()
            .map(|op| ExportedOutputParameter {
                temp_id: op.id,
                name: op.name.clone(),
                start: op.start,
                end: op.end,
                values: op
                    .fuzzy_output_values
                    .iter()
                    .map(|fov| ExportedFuzzyOutputValue {
                        temp_id: fov.id,
                        value: fov.value.clone(),
                        a: fov.a,
                        b: fov.b,
                        c: fov.c,
                        d: fov.d,
                        is_triangle: fov.is_triangle,
                    })
                    .collect(),
            })
            .collect();

        // Rules
        let rules = p
            .output_values
            .iter()
            .map(|ov| ExportedOutputValue {
                output_parameter_temp_id: ov.output_parameter_id,
                fuzzy_output_value_temp_id: ov.fuzzy_output_value_id,
                input_value_temp_ids: ov
                    .input_value_ids
                    .replace('|', ",")
                    .split(',')
                    .map(|s| s.trim())
                    .filter(|s| !s.is_empty())
                    .filter_map(|s| s.parse::<i64>().ok())
                    .collect(),
            })
            .collect();

        Ok(ExportedProblem {
            name: p.name,
            description: p.description,
            is_final: p.is_final,
            image: image_dto,
            input_parameters: inputs,
            output_parameters: outputs,
            output_values: rules,
            children: children_dtos,
        })
    }
}
