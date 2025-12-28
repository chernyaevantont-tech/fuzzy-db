use crate::domain::entities::output_value::OutputValue;
use crate::domain::services::fuzzification::FuzzifiedParameter;
use std::collections::HashMap;

/// Represents a fired rule with its activation strength
#[derive(Debug, Clone)]
pub struct FiredRule {
    pub output_value_id: i64,
    pub fuzzy_output_value_id: i64,
    pub firing_strength: f32,
}

/// Represents the result of inference for a single output parameter
#[derive(Debug, Clone)]
pub struct InferenceResult {
    pub output_parameter_id: i64,
    /// Fired rules with their fuzzy output values and strengths
    pub fired_rules: Vec<FiredRule>,
}

/// Parses the input_value_ids string format "|id1||id2||id3|" into a vector of IDs
fn parse_input_value_ids(input_value_ids: &str) -> Vec<i64> {
    input_value_ids
        .split("||")
        .filter_map(|s| {
            let trimmed = s.trim_matches('|');
            if trimmed.is_empty() {
                None
            } else {
                trimmed.parse::<i64>().ok()
            }
        })
        .collect()
}

/// Evaluates fuzzy rules using Mamdani inference (min T-norm for AND)
///
/// For each rule, the firing strength is calculated as the minimum
/// of all input membership degrees (AND operation).
///
/// # Arguments
/// * `fuzzified_inputs` - The fuzzified input parameters
/// * `rules` - The output values (rules) mapping input combinations to fuzzy outputs
/// * `output_parameter_id` - The ID of the output parameter being evaluated
///
/// # Returns
/// InferenceResult containing all fired rules with their strengths
pub fn evaluate_rules(
    fuzzified_inputs: &[FuzzifiedParameter],
    rules: &[OutputValue],
    output_parameter_id: i64,
) -> InferenceResult {
    // Build a lookup map for quick access to membership degrees
    // Key: input_value_id, Value: membership_degree
    let membership_map: HashMap<i64, f32> = fuzzified_inputs
        .iter()
        .flat_map(|fp| {
            fp.fuzzified_values
                .iter()
                .map(|fv| (fv.input_value_id, fv.membership_degree))
        })
        .collect();

    let fired_rules: Vec<FiredRule> = rules
        .iter()
        .filter(|rule| rule.output_parameter_id == output_parameter_id)
        .filter_map(|rule| {
            // Skip rules without a fuzzy output value assigned
            let fuzzy_output_id = rule.fuzzy_output_value_id?;

            // Parse input value IDs from the rule
            let input_value_ids = parse_input_value_ids(&rule.input_value_ids);

            if input_value_ids.is_empty() {
                return None;
            }

            // Calculate firing strength as MIN of all input membership degrees (AND)
            let firing_strength = input_value_ids
                .iter()
                .filter_map(|id| membership_map.get(id))
                .copied()
                .fold(f32::MAX, f32::min);

            // Only include rules that actually fire (strength > 0)
            if firing_strength > 0.0 && firing_strength != f32::MAX {
                Some(FiredRule {
                    output_value_id: rule.id,
                    fuzzy_output_value_id: fuzzy_output_id,
                    firing_strength,
                })
            } else {
                None
            }
        })
        .collect();

    InferenceResult {
        output_parameter_id,
        fired_rules,
    }
}

/// Evaluates all rules for all output parameters
///
/// # Arguments
/// * `fuzzified_inputs` - The fuzzified input parameters
/// * `all_rules` - All output value rules
/// * `output_parameter_ids` - IDs of output parameters to evaluate
///
/// # Returns
/// Vector of InferenceResult for each output parameter
pub fn evaluate_all_rules(
    fuzzified_inputs: &[FuzzifiedParameter],
    all_rules: &[OutputValue],
    output_parameter_ids: &[i64],
) -> Vec<InferenceResult> {
    output_parameter_ids
        .iter()
        .map(|&param_id| evaluate_rules(fuzzified_inputs, all_rules, param_id))
        .collect()
}

/// Aggregates fired rules by fuzzy output value, taking the maximum firing strength
/// for each unique fuzzy output value (MAX aggregation / S-norm)
///
/// # Arguments
/// * `inference_result` - The result of rule evaluation
///
/// # Returns
/// Vector of (fuzzy_output_value_id, max_firing_strength) pairs
pub fn aggregate_fired_rules(inference_result: &InferenceResult) -> Vec<(i64, f32)> {
    let mut aggregated: HashMap<i64, f32> = HashMap::new();

    for rule in &inference_result.fired_rules {
        let entry = aggregated
            .entry(rule.fuzzy_output_value_id)
            .or_insert(0.0);
        *entry = entry.max(rule.firing_strength);
    }

    aggregated.into_iter().collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::services::fuzzification::{FuzzifiedParameter, FuzzifiedValue};

    #[test]
    fn test_parse_input_value_ids() {
        let ids = parse_input_value_ids("|1||2||3|");
        assert_eq!(ids, vec![1, 2, 3]);

        let ids = parse_input_value_ids("|42|");
        assert_eq!(ids, vec![42]);

        let ids = parse_input_value_ids("");
        assert!(ids.is_empty());
    }

    #[test]
    fn test_evaluate_rules_simple() {
        let fuzzified_inputs = vec![
            FuzzifiedParameter {
                input_parameter_id: 1,
                fuzzified_values: vec![
                    FuzzifiedValue {
                        input_value_id: 10,
                        membership_degree: 0.8,
                    },
                    FuzzifiedValue {
                        input_value_id: 11,
                        membership_degree: 0.2,
                    },
                ],
            },
            FuzzifiedParameter {
                input_parameter_id: 2,
                fuzzified_values: vec![
                    FuzzifiedValue {
                        input_value_id: 20,
                        membership_degree: 0.6,
                    },
                    FuzzifiedValue {
                        input_value_id: 21,
                        membership_degree: 0.4,
                    },
                ],
            },
        ];

        let rules = vec![
            OutputValue {
                id: 1,
                output_parameter_id: 100,
                fuzzy_output_value_id: Some(1000),
                input_value_ids: "|10||20|".to_string(),
            },
            OutputValue {
                id: 2,
                output_parameter_id: 100,
                fuzzy_output_value_id: Some(1001),
                input_value_ids: "|11||21|".to_string(),
            },
        ];

        let result = evaluate_rules(&fuzzified_inputs, &rules, 100);

        assert_eq!(result.output_parameter_id, 100);
        assert_eq!(result.fired_rules.len(), 2);

        // Rule 1: min(0.8, 0.6) = 0.6
        let rule1 = result.fired_rules.iter().find(|r| r.output_value_id == 1).unwrap();
        assert_eq!(rule1.firing_strength, 0.6);

        // Rule 2: min(0.2, 0.4) = 0.2
        let rule2 = result.fired_rules.iter().find(|r| r.output_value_id == 2).unwrap();
        assert_eq!(rule2.firing_strength, 0.2);
    }

    #[test]
    fn test_aggregate_fired_rules() {
        let inference_result = InferenceResult {
            output_parameter_id: 100,
            fired_rules: vec![
                FiredRule {
                    output_value_id: 1,
                    fuzzy_output_value_id: 1000,
                    firing_strength: 0.6,
                },
                FiredRule {
                    output_value_id: 2,
                    fuzzy_output_value_id: 1000,
                    firing_strength: 0.4,
                },
                FiredRule {
                    output_value_id: 3,
                    fuzzy_output_value_id: 1001,
                    firing_strength: 0.3,
                },
            ],
        };

        let aggregated = aggregate_fired_rules(&inference_result);

        // fuzzy_output_value 1000: max(0.6, 0.4) = 0.6
        let val_1000 = aggregated.iter().find(|(id, _)| *id == 1000).unwrap();
        assert_eq!(val_1000.1, 0.6);

        // fuzzy_output_value 1001: 0.3
        let val_1001 = aggregated.iter().find(|(id, _)| *id == 1001).unwrap();
        assert_eq!(val_1001.1, 0.3);
    }
}
