use crate::domain::entities::input_value::InputValue;
use crate::domain::services::membership_function::calculate_membership;

/// Represents a fuzzified input value with its membership degree
#[derive(Debug, Clone)]
pub struct FuzzifiedValue {
    pub input_value_id: i64,
    pub membership_degree: f32,
}

/// Represents all fuzzified values for a single input parameter
#[derive(Debug, Clone)]
pub struct FuzzifiedParameter {
    pub input_parameter_id: i64,
    pub fuzzified_values: Vec<FuzzifiedValue>,
}

/// Fuzzifies a crisp input value against all input values (linguistic terms) of a parameter
///
/// # Arguments
/// * `crisp_value` - The crisp input value to fuzzify
/// * `input_parameter_id` - The ID of the input parameter
/// * `input_values` - All linguistic terms (fuzzy sets) for this parameter
///
/// # Returns
/// A FuzzifiedParameter containing membership degrees for each linguistic term
pub fn fuzzify_input(
    crisp_value: f32,
    input_parameter_id: i64,
    input_values: &[InputValue],
) -> FuzzifiedParameter {
    let fuzzified_values: Vec<FuzzifiedValue> = input_values
        .iter()
        .map(|iv| {
            let membership = calculate_membership(
                crisp_value,
                iv.a,
                iv.b,
                iv.c,
                iv.d,
                iv.is_triangle,
            );
            FuzzifiedValue {
                input_value_id: iv.id,
                membership_degree: membership,
            }
        })
        .collect();

    FuzzifiedParameter {
        input_parameter_id,
        fuzzified_values,
    }
}

/// Fuzzifies multiple crisp inputs against their respective input parameters
///
/// # Arguments
/// * `crisp_inputs` - Vector of (input_parameter_id, crisp_value) pairs
/// * `all_input_values` - All input values grouped by their parameters
///
/// # Returns
/// Vector of FuzzifiedParameter for each input
pub fn fuzzify_all_inputs(
    crisp_inputs: &[(i64, f32)],
    all_input_values: &[(i64, Vec<InputValue>)],
) -> Vec<FuzzifiedParameter> {
    crisp_inputs
        .iter()
        .filter_map(|(param_id, crisp_value)| {
            all_input_values
                .iter()
                .find(|(id, _)| id == param_id)
                .map(|(_, input_values)| fuzzify_input(*crisp_value, *param_id, input_values))
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_input_values() -> Vec<InputValue> {
        vec![
            InputValue {
                id: 1,
                input_parameter_id: 100,
                value: "Low".to_string(),
                a: 0.0,
                b: 0.0,
                c: 2.0,
                d: 4.0,
                is_triangle: false,
            },
            InputValue {
                id: 2,
                input_parameter_id: 100,
                value: "Medium".to_string(),
                a: 2.0,
                b: 4.0,
                c: 6.0,
                d: 8.0,
                is_triangle: false,
            },
            InputValue {
                id: 3,
                input_parameter_id: 100,
                value: "High".to_string(),
                a: 6.0,
                b: 8.0,
                c: 10.0,
                d: 10.0,
                is_triangle: false,
            },
        ]
    }

    #[test]
    fn test_fuzzify_low_value() {
        let input_values = create_test_input_values();
        let result = fuzzify_input(1.0, 100, &input_values);

        assert_eq!(result.input_parameter_id, 100);
        assert_eq!(result.fuzzified_values.len(), 3);

        // Value 1.0 should be fully in "Low"
        assert_eq!(result.fuzzified_values[0].membership_degree, 1.0);
        assert_eq!(result.fuzzified_values[1].membership_degree, 0.0);
        assert_eq!(result.fuzzified_values[2].membership_degree, 0.0);
    }

    #[test]
    fn test_fuzzify_overlap_value() {
        let input_values = create_test_input_values();
        let result = fuzzify_input(3.0, 100, &input_values);

        // Value 3.0 should be partially in "Low" (falling) and "Medium" (rising)
        assert!(result.fuzzified_values[0].membership_degree > 0.0);
        assert!(result.fuzzified_values[0].membership_degree < 1.0);
        assert!(result.fuzzified_values[1].membership_degree > 0.0);
        assert!(result.fuzzified_values[1].membership_degree < 1.0);
        assert_eq!(result.fuzzified_values[2].membership_degree, 0.0);
    }
}
