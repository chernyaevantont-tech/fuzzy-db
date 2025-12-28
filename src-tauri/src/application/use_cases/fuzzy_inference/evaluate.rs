use crate::domain::{
    entities::problem::Problem,
    error::DomainError,
    repository::ProblemRepository,
    services::{
        defuzzification::{defuzzify, DefuzzificationMethod},
        fuzzification::{fuzzify_input, FuzzifiedParameter},
        inference::{aggregate_fired_rules, evaluate_rules},
    },
};

/// Input for the fuzzy evaluation use case
#[derive(Debug, Clone)]
pub struct FuzzyEvaluationInput {
    pub input_parameter_id: i64,
    pub crisp_value: f32,
}

/// Complete result of fuzzy inference for one output parameter
#[derive(Debug, Clone)]
pub struct FuzzyEvaluationOutputResult {
    pub output_parameter_id: i64,
    pub output_parameter_name: String,
    pub crisp_value: f32,
    pub fuzzified_inputs: Vec<FuzzifiedInputInfo>,
    pub fired_rules_count: usize,
}

/// Information about a fuzzified input for debugging/display
#[derive(Debug, Clone)]
pub struct FuzzifiedInputInfo {
    pub input_parameter_id: i64,
    pub input_parameter_name: String,
    pub crisp_value: f32,
    pub membership_degrees: Vec<(String, f32)>, // (linguistic_term_name, degree)
}

/// Complete result of the fuzzy evaluation
#[derive(Debug, Clone)]
pub struct FuzzyEvaluationResult {
    pub problem_id: i64,
    pub problem_name: String,
    pub outputs: Vec<FuzzyEvaluationOutputResult>,
}

/// Use case for evaluating a fuzzy inference system
pub struct EvaluateFuzzySystemUseCase<'a> {
    problem_repository: &'a dyn ProblemRepository,
}

impl<'a> EvaluateFuzzySystemUseCase<'a> {
    pub fn new(problem_repository: &'a dyn ProblemRepository) -> Self {
        Self { problem_repository }
    }

    /// Executes the full fuzzy inference cycle:
    /// 1. Fuzzification - convert crisp inputs to membership degrees
    /// 2. Rule Evaluation - evaluate all rules using min T-norm
    /// 3. Aggregation - combine fired rules using max S-norm
    /// 4. Defuzzification - convert aggregated output to crisp value
    ///
    /// # Arguments
    /// * `problem_id` - The ID of the problem to evaluate
    /// * `inputs` - Vector of crisp input values for each input parameter
    /// * `method` - The defuzzification method to use
    /// * `resolution` - Number of discrete points for numerical integration
    ///
    /// # Returns
    /// FuzzyEvaluationResult containing crisp outputs and debug information
    pub fn execute(
        &self,
        problem_id: i64,
        inputs: Vec<FuzzyEvaluationInput>,
        method: DefuzzificationMethod,
        resolution: usize,
    ) -> Result<FuzzyEvaluationResult, DomainError> {
        // Load the full problem with all parameters and rules
        let problem = self.problem_repository.get_full_by_id(problem_id)?;

        // Validate that all input parameters are provided
        self.validate_inputs(&problem, &inputs)?;

        // Step 1: Fuzzification
        let fuzzified_params = self.fuzzify_all(&problem, &inputs);

        // Build fuzzified input info for the result
        let fuzzified_inputs_info = self.build_fuzzified_info(&problem, &inputs, &fuzzified_params);

        // Step 2-4: Evaluate each output parameter
        let outputs: Vec<FuzzyEvaluationOutputResult> = problem
            .output_parameters
            .iter()
            .map(|output_param| {
                // Step 2: Rule Evaluation
                let inference_result =
                    evaluate_rules(&fuzzified_params, &problem.output_values, output_param.id);

                // Step 3: Aggregation
                let aggregated = aggregate_fired_rules(&inference_result);

                // Step 4: Defuzzification
                let defuzz_result = defuzzify(
                    &aggregated,
                    &output_param.fuzzy_output_values,
                    output_param.id,
                    output_param.start,
                    output_param.end,
                    method,
                    resolution,
                );

                FuzzyEvaluationOutputResult {
                    output_parameter_id: output_param.id,
                    output_parameter_name: output_param.name.clone(),
                    crisp_value: defuzz_result.crisp_value,
                    fuzzified_inputs: fuzzified_inputs_info.clone(),
                    fired_rules_count: inference_result.fired_rules.len(),
                }
            })
            .collect();

        Ok(FuzzyEvaluationResult {
            problem_id: problem.id,
            problem_name: problem.name,
            outputs,
        })
    }

    /// Validates that all required input parameters are provided
    fn validate_inputs(
        &self,
        problem: &Problem,
        inputs: &[FuzzyEvaluationInput],
    ) -> Result<(), DomainError> {
        for input_param in &problem.input_parameters {
            if !inputs.iter().any(|i| i.input_parameter_id == input_param.id) {
                return Err(DomainError::ValidationError(format!(
                    "Missing input value for parameter '{}'",
                    input_param.name
                )));
            }
        }
        Ok(())
    }

    /// Fuzzifies all input values
    fn fuzzify_all(
        &self,
        problem: &Problem,
        inputs: &[FuzzyEvaluationInput],
    ) -> Vec<FuzzifiedParameter> {
        inputs
            .iter()
            .filter_map(|input| {
                problem
                    .input_parameters
                    .iter()
                    .find(|ip| ip.id == input.input_parameter_id)
                    .map(|input_param| {
                        fuzzify_input(
                            input.crisp_value,
                            input_param.id,
                            &input_param.input_values,
                        )
                    })
            })
            .collect()
    }

    /// Builds fuzzified input info for the result
    fn build_fuzzified_info(
        &self,
        problem: &Problem,
        inputs: &[FuzzyEvaluationInput],
        fuzzified_params: &[FuzzifiedParameter],
    ) -> Vec<FuzzifiedInputInfo> {
        fuzzified_params
            .iter()
            .filter_map(|fp| {
                let input_param = problem
                    .input_parameters
                    .iter()
                    .find(|ip| ip.id == fp.input_parameter_id)?;

                let crisp_value = inputs
                    .iter()
                    .find(|i| i.input_parameter_id == fp.input_parameter_id)?
                    .crisp_value;

                let membership_degrees: Vec<(String, f32)> = fp
                    .fuzzified_values
                    .iter()
                    .filter_map(|fv| {
                        input_param
                            .input_values
                            .iter()
                            .find(|iv| iv.id == fv.input_value_id)
                            .map(|iv| (iv.value.clone(), fv.membership_degree))
                    })
                    .collect();

                Some(FuzzifiedInputInfo {
                    input_parameter_id: fp.input_parameter_id,
                    input_parameter_name: input_param.name.clone(),
                    crisp_value,
                    membership_degrees,
                })
            })
            .collect()
    }
}
