use crate::domain::entities::fuzzy_output_value::FuzzyOutputValue;
use crate::domain::services::membership_function::calculate_membership;

/// Available defuzzification methods
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum DefuzzificationMethod {
    /// Center of Gravity (Centroid) - most commonly used
    Centroid,
    /// Bisector of Area
    Bisector,
    /// Mean of Maximum
    MeanOfMaximum,
    /// Smallest of Maximum
    SmallestOfMaximum,
    /// Largest of Maximum
    LargestOfMaximum,
}

/// Result of defuzzification for a single output parameter
#[derive(Debug, Clone)]
pub struct DefuzzificationResult {
    pub output_parameter_id: i64,
    pub crisp_value: f32,
    pub method: DefuzzificationMethod,
}

/// Calculates the aggregated membership value at a point x
/// using MAX aggregation (S-norm) of all clipped fuzzy sets
///
/// # Arguments
/// * `x` - The point to evaluate
/// * `clipped_sets` - Vector of (FuzzyOutputValue, clipping_level) pairs
///
/// # Returns
/// The maximum membership value at point x after clipping
fn aggregated_membership_at(x: f32, clipped_sets: &[(FuzzyOutputValue, f32)]) -> f32 {
    clipped_sets
        .iter()
        .map(|(fov, clip_level)| {
            let raw_membership = calculate_membership(x, fov.a, fov.b, fov.c, fov.d, fov.is_triangle);
            // Clip the membership function at the firing strength
            raw_membership.min(*clip_level)
        })
        .fold(0.0_f32, f32::max)
}

/// Defuzzifies using the Centroid (Center of Gravity) method
///
/// Formula: x* = ∫(x · μ(x) dx) / ∫(μ(x) dx)
///
/// Uses numerical integration with discrete sampling
///
/// # Arguments
/// * `clipped_sets` - Vector of (FuzzyOutputValue, clipping_level) pairs
/// * `start` - Start of the universe of discourse
/// * `end` - End of the universe of discourse
/// * `resolution` - Number of discrete points for integration
///
/// # Returns
/// The defuzzified crisp value
pub fn defuzzify_centroid(
    clipped_sets: &[(FuzzyOutputValue, f32)],
    start: f32,
    end: f32,
    resolution: usize,
) -> f32 {
    if clipped_sets.is_empty() || resolution == 0 {
        return (start + end) / 2.0; // Return midpoint as default
    }

    let step = (end - start) / (resolution as f32);
    let mut numerator = 0.0_f32;
    let mut denominator = 0.0_f32;

    for i in 0..=resolution {
        let x = start + (i as f32) * step;
        let mu = aggregated_membership_at(x, clipped_sets);

        numerator += x * mu;
        denominator += mu;
    }

    if denominator.abs() < f32::EPSILON {
        (start + end) / 2.0 // Return midpoint if no membership
    } else {
        numerator / denominator
    }
}

/// Defuzzifies using the Bisector method
///
/// Finds the point x where the area under the curve is divided into two equal parts
///
/// # Arguments
/// * `clipped_sets` - Vector of (FuzzyOutputValue, clipping_level) pairs
/// * `start` - Start of the universe of discourse
/// * `end` - End of the universe of discourse
/// * `resolution` - Number of discrete points for integration
///
/// # Returns
/// The defuzzified crisp value
pub fn defuzzify_bisector(
    clipped_sets: &[(FuzzyOutputValue, f32)],
    start: f32,
    end: f32,
    resolution: usize,
) -> f32 {
    if clipped_sets.is_empty() || resolution == 0 {
        return (start + end) / 2.0;
    }

    let step = (end - start) / (resolution as f32);

    // Calculate total area
    let mut total_area = 0.0_f32;
    for i in 0..=resolution {
        let x = start + (i as f32) * step;
        total_area += aggregated_membership_at(x, clipped_sets);
    }

    if total_area.abs() < f32::EPSILON {
        return (start + end) / 2.0;
    }

    let half_area = total_area / 2.0;
    let mut cumulative_area = 0.0_f32;

    // Find the bisector point
    for i in 0..=resolution {
        let x = start + (i as f32) * step;
        cumulative_area += aggregated_membership_at(x, clipped_sets);

        if cumulative_area >= half_area {
            return x;
        }
    }

    end
}

/// Finds all maximum points in the aggregated fuzzy set
fn find_maximum_points(
    clipped_sets: &[(FuzzyOutputValue, f32)],
    start: f32,
    end: f32,
    resolution: usize,
) -> (f32, Vec<f32>) {
    let step = (end - start) / (resolution as f32);
    let mut max_value = 0.0_f32;
    let mut max_points: Vec<f32> = Vec::new();

    for i in 0..=resolution {
        let x = start + (i as f32) * step;
        let mu = aggregated_membership_at(x, clipped_sets);

        if mu > max_value + f32::EPSILON {
            max_value = mu;
            max_points.clear();
            max_points.push(x);
        } else if (mu - max_value).abs() < f32::EPSILON {
            max_points.push(x);
        }
    }

    (max_value, max_points)
}

/// Defuzzifies using the Mean of Maximum (MOM) method
///
/// Returns the mean of all points where the membership function reaches its maximum
pub fn defuzzify_mean_of_maximum(
    clipped_sets: &[(FuzzyOutputValue, f32)],
    start: f32,
    end: f32,
    resolution: usize,
) -> f32 {
    if clipped_sets.is_empty() || resolution == 0 {
        return (start + end) / 2.0;
    }

    let (_, max_points) = find_maximum_points(clipped_sets, start, end, resolution);

    if max_points.is_empty() {
        (start + end) / 2.0
    } else {
        max_points.iter().sum::<f32>() / (max_points.len() as f32)
    }
}

/// Defuzzifies using the Smallest of Maximum (SOM) method
///
/// Returns the smallest point where the membership function reaches its maximum
pub fn defuzzify_smallest_of_maximum(
    clipped_sets: &[(FuzzyOutputValue, f32)],
    start: f32,
    end: f32,
    resolution: usize,
) -> f32 {
    if clipped_sets.is_empty() || resolution == 0 {
        return start;
    }

    let (_, max_points) = find_maximum_points(clipped_sets, start, end, resolution);

    max_points.first().copied().unwrap_or(start)
}

/// Defuzzifies using the Largest of Maximum (LOM) method
///
/// Returns the largest point where the membership function reaches its maximum
pub fn defuzzify_largest_of_maximum(
    clipped_sets: &[(FuzzyOutputValue, f32)],
    start: f32,
    end: f32,
    resolution: usize,
) -> f32 {
    if clipped_sets.is_empty() || resolution == 0 {
        return end;
    }

    let (_, max_points) = find_maximum_points(clipped_sets, start, end, resolution);

    max_points.last().copied().unwrap_or(end)
}

/// Main defuzzification function that dispatches to the appropriate method
///
/// # Arguments
/// * `aggregated_rules` - Vector of (fuzzy_output_value_id, firing_strength) pairs
/// * `fuzzy_output_values` - All fuzzy output values for this parameter
/// * `output_parameter_id` - The ID of the output parameter
/// * `start` - Start of the universe of discourse
/// * `end` - End of the universe of discourse
/// * `method` - The defuzzification method to use
/// * `resolution` - Number of discrete points (default: 100)
///
/// # Returns
/// DefuzzificationResult containing the crisp output value
pub fn defuzzify(
    aggregated_rules: &[(i64, f32)],
    fuzzy_output_values: &[FuzzyOutputValue],
    output_parameter_id: i64,
    start: f32,
    end: f32,
    method: DefuzzificationMethod,
    resolution: usize,
) -> DefuzzificationResult {
    // Build clipped sets from aggregated rules
    let clipped_sets: Vec<(FuzzyOutputValue, f32)> = aggregated_rules
        .iter()
        .filter_map(|(fov_id, strength)| {
            fuzzy_output_values
                .iter()
                .find(|fov| fov.id == *fov_id)
                .map(|fov| (fov.clone(), *strength))
        })
        .collect();

    let crisp_value = match method {
        DefuzzificationMethod::Centroid => {
            defuzzify_centroid(&clipped_sets, start, end, resolution)
        }
        DefuzzificationMethod::Bisector => {
            defuzzify_bisector(&clipped_sets, start, end, resolution)
        }
        DefuzzificationMethod::MeanOfMaximum => {
            defuzzify_mean_of_maximum(&clipped_sets, start, end, resolution)
        }
        DefuzzificationMethod::SmallestOfMaximum => {
            defuzzify_smallest_of_maximum(&clipped_sets, start, end, resolution)
        }
        DefuzzificationMethod::LargestOfMaximum => {
            defuzzify_largest_of_maximum(&clipped_sets, start, end, resolution)
        }
    };

    DefuzzificationResult {
        output_parameter_id,
        crisp_value,
        method,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_fuzzy_output_values() -> Vec<FuzzyOutputValue> {
        vec![
            FuzzyOutputValue {
                id: 1,
                output_parameter_id: 100,
                value: "Low".to_string(),
                a: 0.0,
                b: 0.0,
                c: 2.0,
                d: 4.0,
                is_triangle: false,
            },
            FuzzyOutputValue {
                id: 2,
                output_parameter_id: 100,
                value: "Medium".to_string(),
                a: 2.0,
                b: 4.0,
                c: 6.0,
                d: 8.0,
                is_triangle: false,
            },
            FuzzyOutputValue {
                id: 3,
                output_parameter_id: 100,
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
    fn test_defuzzify_centroid_single_set() {
        let fovs = create_test_fuzzy_output_values();
        let aggregated = vec![(1, 1.0)]; // Full activation of "Low"

        let result = defuzzify(
            &aggregated,
            &fovs,
            100,
            0.0,
            10.0,
            DefuzzificationMethod::Centroid,
            100,
        );

        // Centroid of "Low" trapezoid should be around 1.33 (left-skewed)
        assert!(result.crisp_value < 3.0);
        assert!(result.crisp_value >= 0.0);
    }

    #[test]
    fn test_defuzzify_centroid_multiple_sets() {
        let fovs = create_test_fuzzy_output_values();
        let aggregated = vec![(1, 0.5), (3, 0.5)]; // Equal activation of "Low" and "High"

        let result = defuzzify(
            &aggregated,
            &fovs,
            100,
            0.0,
            10.0,
            DefuzzificationMethod::Centroid,
            100,
        );

        // Should be around the middle
        assert!(result.crisp_value > 3.0);
        assert!(result.crisp_value < 7.0);
    }

    #[test]
    fn test_defuzzify_mean_of_maximum() {
        let fovs = create_test_fuzzy_output_values();
        let aggregated = vec![(2, 1.0)]; // Full activation of "Medium"

        let result = defuzzify(
            &aggregated,
            &fovs,
            100,
            0.0,
            10.0,
            DefuzzificationMethod::MeanOfMaximum,
            100,
        );

        // MOM of "Medium" should be around 5 (center of plateau)
        assert!(result.crisp_value >= 4.0);
        assert!(result.crisp_value <= 6.0);
    }

    #[test]
    fn test_defuzzify_empty_aggregation() {
        let fovs = create_test_fuzzy_output_values();
        let aggregated: Vec<(i64, f32)> = vec![];

        let result = defuzzify(
            &aggregated,
            &fovs,
            100,
            0.0,
            10.0,
            DefuzzificationMethod::Centroid,
            100,
        );

        // Should return midpoint
        assert_eq!(result.crisp_value, 5.0);
    }
}
