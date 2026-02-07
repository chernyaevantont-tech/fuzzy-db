/// Fuzzy Partition utilities for overlapping trapezoidal membership functions (Ruspini partition)
///
/// For adjacent terms A, B, C with points (a, b, c, d):
/// - A.c = B.a, A.d = B.b (overlap region)
/// - B.c = C.a, B.d = C.b
/// - Constraint: a < b <= c < d (a = c only for triangular terms)
///
/// This ensures sum of memberships = 1 at every point because:
/// - In overlap region: falling edge of left term + rising edge of right term = 1
/// - In plateau: exactly one term has membership 1

/// Calculate membership value for a trapezoidal fuzzy set at a given point x
/// 
/// For a trapezoidal function with parameters (a, b, c, d):
/// - μ(x) = 0 when x < a or x > d (strictly outside)
/// - μ(x) = (x - a) / (b - a) when a <= x < b (rising edge), but if a=b, skip
/// - μ(x) = 1 when b <= x <= c (plateau)
/// - μ(x) = (d - x) / (d - c) when c < x <= d (falling edge), but if c=d, skip
///
/// Special cases for Ruspini partition:
/// - First term: a = b (no rising edge, plateau starts at a)
/// - Last term: c = d (no falling edge, plateau ends at d)
pub fn membership_value(x: f32, a: f32, b: f32, c: f32, d: f32) -> f32 {
    // Strictly outside range
    if x < a || x > d {
        return 0.0;
    }

    // Handle case when a = b (first term): no rising edge
    // x = a = b should be in plateau
    if (a - b).abs() < f32::EPSILON {
        // No rising edge, go directly to plateau or falling
        if x <= c {
            return 1.0; // Plateau
        }
        // Falling edge (c < x <= d)
        if (c - d).abs() < f32::EPSILON {
            return 1.0; // c = d means plateau extends to d
        }
        return (d - x) / (d - c);
    }

    // Handle case when c = d (last term): no falling edge
    // x = c = d should be in plateau
    if (c - d).abs() < f32::EPSILON {
        if x < b {
            return (x - a) / (b - a); // Rising edge
        }
        return 1.0; // Plateau extends to d
    }

    // Normal trapezoidal case
    // Rising edge (a <= x < b)
    if x < b {
        return (x - a) / (b - a);
    }

    // Plateau (b <= x <= c)
    if x <= c {
        return 1.0;
    }

    // Falling edge (c < x <= d)
    (d - x) / (d - c)
}

/// Calculate sum of membership values at a given point for all terms
pub fn sum_memberships(terms: &[(f32, f32, f32, f32)], x: f32) -> f32 {
    terms
        .iter()
        .map(|(a, b, c, d)| membership_value(x, *a, *b, *c, *d))
        .sum()
}

/// Check if a set of fuzzy terms forms a valid fuzzy partition (Ruspini partition)
/// 
/// A valid partition means:
/// 1. For each term: a <= b <= c <= d (first term: a=b, last term: c=d allowed)
/// 2. First term: a = b = start
/// 3. Last term: c = d = end
/// 4. Adjacent terms: prev.c = next.a, prev.d = next.b
/// 5. Sum of membership values at any point within [start, end] equals 1
pub fn validate_fuzzy_partition(
    terms: &[(f32, f32, f32, f32)], // (a, b, c, d) for each term
    start: f32,
    end: f32,
    tolerance: f32,
) -> Result<(), String> {
    if terms.is_empty() {
        return Err("No terms provided".to_string());
    }

    // Check constraint a <= b <= c <= d for each term
    // First term: a = b (allowed)
    // Last term: c = d (allowed)
    let num_terms = terms.len();
    for (i, term) in terms.iter().enumerate() {
        let is_first = i == 0;
        let is_last = i == num_terms - 1;
        
        // First term: a <= b (a = b allowed)
        // Other terms: a < b (strict)
        if is_first {
            if term.0 > term.1 {
                return Err(format!(
                    "Term {}: a ({}) must be <= b ({})",
                    i, term.0, term.1
                ));
            }
        } else {
            if term.0 >= term.1 {
                return Err(format!(
                    "Term {}: a ({}) must be < b ({})",
                    i, term.0, term.1
                ));
            }
        }
        
        if term.1 > term.2 {
            return Err(format!(
                "Term {}: b ({}) must be <= c ({})",
                i, term.1, term.2
            ));
        }
        
        // Last term: c <= d (c = d allowed)
        // Other terms: c < d (strict)
        if is_last {
            if term.2 > term.3 {
                return Err(format!(
                    "Term {}: c ({}) must be <= d ({})",
                    i, term.2, term.3
                ));
            }
        } else {
            if term.2 >= term.3 {
                return Err(format!(
                    "Term {}: c ({}) must be < d ({})",
                    i, term.2, term.3
                ));
            }
        }
    }

    // Check first term: a = b = start
    let first = &terms[0];
    if (first.0 - start).abs() > tolerance {
        return Err(format!(
            "First term's 'a' ({}) should equal start ({})",
            first.0, start
        ));
    }
    if (first.1 - start).abs() > tolerance {
        return Err(format!(
            "First term's 'b' ({}) should equal start ({})",
            first.1, start
        ));
    }

    // Check last term: c = d = end
    let last = &terms[terms.len() - 1];
    if (last.2 - end).abs() > tolerance {
        return Err(format!(
            "Last term's 'c' ({}) should equal end ({})",
            last.2, end
        ));
    }
    if (last.3 - end).abs() > tolerance {
        return Err(format!(
            "Last term's 'd' ({}) should equal end ({})",
            last.3, end
        ));
    }

    // Check adjacency constraints: prev.c = next.a, prev.d = next.b
    for i in 0..terms.len() - 1 {
        let curr = &terms[i];
        let next = &terms[i + 1];

        if (curr.2 - next.0).abs() > tolerance {
            return Err(format!(
                "Term {}'s 'c' ({}) should equal term {}'s 'a' ({})",
                i, curr.2, i + 1, next.0
            ));
        }

        if (curr.3 - next.1).abs() > tolerance {
            return Err(format!(
                "Term {}'s 'd' ({}) should equal term {}'s 'b' ({})",
                i, curr.3, i + 1, next.1
            ));
        }
    }

    // Check membership sum at multiple points within [start, end]
    let num_samples = 100;
    for i in 0..=num_samples {
        let x = start + (end - start) * (i as f32) / (num_samples as f32);
        let sum = sum_memberships(terms, x);

        if (sum - 1.0).abs() > tolerance {
            return Err(format!(
                "Sum of membership values at x={:.4} is {:.4} (expected 1.0)",
                x, sum
            ));
        }
    }

    Ok(())
}

/// Create default partition with n overlapping terms
pub fn create_default_partition(num_terms: usize, start: f32, end: f32) -> Vec<(f32, f32, f32, f32)> {
    if num_terms == 0 {
        return vec![];
    }

    let range = end - start;

    if num_terms == 1 {
        // Single term: a = b = start, c = d = end
        return vec![(start, start, end, end)];
    }

    let overlap_width = range / (num_terms as f32 - 1.0) / 2.0;
    let mut terms = Vec::new();

    for i in 0..num_terms {
        let center = start + (range * i as f32) / (num_terms as f32 - 1.0);

        if i == 0 {
            // First term: a = b = start
            terms.push((start, start, center, center + overlap_width));
        } else if i == num_terms - 1 {
            // Last term: c = d = end
            let prev = terms[i - 1];
            terms.push((prev.2, prev.3, end, end));
        } else {
            // Middle terms
            let prev = terms[i - 1];
            terms.push((prev.2, prev.3, center, center + overlap_width));
        }
    }

    terms
}

#[cfg(test)]
mod tests {
    use super::*;

    const TOLERANCE: f32 = 0.001;

    #[test]
    fn test_membership_value_outside_range() {
        // Term: a=0.2, b=0.3, c=0.5, d=0.6
        // x = a (strictly outside)
        assert_eq!(membership_value(0.2, 0.2, 0.3, 0.5, 0.6), 0.0);
        // x = d (strictly outside)
        assert_eq!(membership_value(0.6, 0.2, 0.3, 0.5, 0.6), 0.0);
        // x < a
        assert_eq!(membership_value(0.1, 0.2, 0.3, 0.5, 0.6), 0.0);
        // x > d
        assert_eq!(membership_value(0.7, 0.2, 0.3, 0.5, 0.6), 0.0);
    }

    #[test]
    fn test_membership_value_rising_edge() {
        // x = 0.25 is in the rising edge between a=0.2 and b=0.3
        let value = membership_value(0.25, 0.2, 0.3, 0.5, 0.6);
        assert!((value - 0.5).abs() < TOLERANCE);
    }

    #[test]
    fn test_membership_value_plateau() {
        // x = 0.4 is in the plateau between b=0.3 and c=0.5
        assert_eq!(membership_value(0.4, 0.2, 0.3, 0.5, 0.6), 1.0);
        // x = b (start of plateau)
        assert_eq!(membership_value(0.3, 0.2, 0.3, 0.5, 0.6), 1.0);
        // x = c (end of plateau)
        assert_eq!(membership_value(0.5, 0.2, 0.3, 0.5, 0.6), 1.0);
    }

    #[test]
    fn test_membership_value_falling_edge() {
        // x = 0.55 is in the falling edge between c=0.5 and d=0.6
        let value = membership_value(0.55, 0.2, 0.3, 0.5, 0.6);
        assert!((value - 0.5).abs() < TOLERANCE);
    }

    #[test]
    fn test_membership_value_triangular() {
        // Triangular: a=0.2, b=0.4, c=0.4, d=0.6
        assert_eq!(membership_value(0.4, 0.2, 0.4, 0.4, 0.6), 1.0); // peak
        assert!((membership_value(0.3, 0.2, 0.4, 0.4, 0.6) - 0.5).abs() < TOLERANCE); // rising
        assert!((membership_value(0.5, 0.2, 0.4, 0.4, 0.6) - 0.5).abs() < TOLERANCE); // falling
    }

    #[test]
    fn test_sum_memberships_overlap() {
        // Two overlapping terms
        let terms = vec![
            (-0.01, 0.0, 0.5, 0.7),
            (0.5, 0.7, 1.0, 1.01),
        ];

        // At x=0.6 (middle of overlap)
        let sum = sum_memberships(&terms, 0.6);
        assert!((sum - 1.0).abs() < TOLERANCE, "Sum at 0.6: {}", sum);
    }

    #[test]
    fn test_sum_memberships_plateau() {
        let terms = vec![
            (-0.01, 0.0, 0.5, 0.7),
            (0.5, 0.7, 1.0, 1.01),
        ];

        // At x=0.3 (in term1 plateau)
        assert!((sum_memberships(&terms, 0.3) - 1.0).abs() < TOLERANCE);
        // At x=0.85 (in term2 plateau)
        assert!((sum_memberships(&terms, 0.85) - 1.0).abs() < TOLERANCE);
    }

    #[test]
    fn test_sum_memberships_three_terms() {
        // A.c=B.a, A.d=B.b, B.c=C.a, B.d=C.b
        let terms = vec![
            (-0.01, 0.0, 0.3, 0.5),
            (0.3, 0.5, 0.7, 0.9),
            (0.7, 0.9, 1.0, 1.01),
        ];

        for x in [0.1, 0.2, 0.4, 0.5, 0.6, 0.8, 0.95] {
            let sum = sum_memberships(&terms, x);
            assert!((sum - 1.0).abs() < TOLERANCE, "Sum at {}: {}", x, sum);
        }
    }

    #[test]
    fn test_validate_single_term() {
        // Single term: a = b = start, c = d = end
        let terms = vec![(0.0, 0.0, 1.0, 1.0)];
        let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
        assert!(result.is_ok(), "{:?}", result);
    }

    #[test]
    fn test_validate_two_terms() {
        // First term: a = b = start
        // Last term: c = d = end
        let terms = vec![
            (0.0, 0.0, 0.5, 0.7),
            (0.5, 0.7, 1.0, 1.0),
        ];
        let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
        assert!(result.is_ok(), "{:?}", result);
    }

    #[test]
    fn test_validate_three_terms() {
        // First term: a = b = start
        // Last term: c = d = end
        let terms = vec![
            (0.0, 0.0, 0.3, 0.5),
            (0.3, 0.5, 0.7, 0.9),
            (0.7, 0.9, 1.0, 1.0),
        ];
        let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
        assert!(result.is_ok(), "{:?}", result);
    }

    #[test]
    fn test_validate_detects_a_gt_b() {
        // For non-first terms, a must be < b
        let terms = vec![
            (0.0, 0.0, 0.3, 0.5),
            (0.4, 0.3, 0.7, 0.9),  // a > b in middle term
            (0.7, 0.9, 1.0, 1.0),
        ];
        let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("must be < b"));
    }

    #[test]
    fn test_validate_detects_b_gt_c() {
        // b > c is invalid for any term
        let terms = vec![(0.0, 0.6, 0.4, 1.0)]; // b > c
        let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("must be <= c"));
    }

    #[test]
    fn test_validate_detects_c_gt_d() {
        // For non-last terms, c must be < d
        let terms = vec![
            (0.0, 0.0, 0.5, 0.4),  // c > d in first term (but first term is also last here, so this is for middle)
            (0.5, 0.7, 1.0, 1.0),
        ];
        let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("must be < d"));
    }

    #[test]
    fn test_validate_detects_wrong_adjacency_c_a() {
        let terms = vec![
            (0.0, 0.0, 0.4, 0.6),
            (0.5, 0.6, 1.0, 1.0), // a != prev.c
        ];
        let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("'c'"));
    }

    #[test]
    fn test_validate_detects_wrong_adjacency_d_b() {
        let terms = vec![
            (0.0, 0.0, 0.5, 0.6),
            (0.5, 0.7, 1.0, 1.0), // b != prev.d
        ];
        let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("'d'"));
    }

    #[test]
    fn test_validate_empty() {
        let result = validate_fuzzy_partition(&[], 0.0, 1.0, TOLERANCE);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("No terms"));
    }

    #[test]
    fn test_create_default_partition_single() {
        let terms = create_default_partition(1, 0.0, 1.0);
        assert_eq!(terms.len(), 1);
        assert_eq!(terms[0].0, 0.0); // a = start
        assert_eq!(terms[0].1, 0.0); // b = start
        assert_eq!(terms[0].2, 1.0); // c = end
        assert_eq!(terms[0].3, 1.0); // d = end
    }

    #[test]
    fn test_create_default_partition_two() {
        let terms = create_default_partition(2, 0.0, 1.0);
        assert_eq!(terms.len(), 2);
        // Check adjacency
        assert_eq!(terms[0].2, terms[1].0); // term0.c = term1.a
        assert_eq!(terms[0].3, terms[1].1); // term0.d = term1.b
        // Check boundaries
        assert_eq!(terms[0].0, 0.0); // first.a = start
        assert_eq!(terms[0].1, 0.0); // first.b = start
        assert_eq!(terms[1].2, 1.0); // last.c = end
        assert_eq!(terms[1].3, 1.0); // last.d = end
    }

    #[test]
    fn test_create_default_partition_valid() {
        for n in 1..=5 {
            let terms = create_default_partition(n, 0.0, 1.0);
            let result = validate_fuzzy_partition(&terms, 0.0, 1.0, TOLERANCE);
            assert!(result.is_ok(), "{} terms: {:?}", n, result);
        }
    }

    #[test]
    fn test_create_default_partition_non_zero_range() {
        let terms = create_default_partition(3, 10.0, 100.0);
        let result = validate_fuzzy_partition(&terms, 10.0, 100.0, TOLERANCE);
        assert!(result.is_ok(), "{:?}", result);
    }

    #[test]
    fn test_create_default_partition_empty() {
        let terms = create_default_partition(0, 0.0, 1.0);
        assert!(terms.is_empty());
    }

    #[test]
    fn test_integration_sum_1000_points_2_terms() {
        let terms = create_default_partition(2, 0.0, 1.0);
        for i in 0..=1000 {
            let x = i as f32 / 1000.0;
            let sum = sum_memberships(&terms, x);
            assert!((sum - 1.0).abs() < TOLERANCE, "x={}: sum={}", x, sum);
        }
    }

    #[test]
    fn test_integration_sum_1000_points_5_terms() {
        let terms = create_default_partition(5, 0.0, 1.0);
        for i in 0..=1000 {
            let x = i as f32 / 1000.0;
            let sum = sum_memberships(&terms, x);
            assert!((sum - 1.0).abs() < TOLERANCE, "x={}: sum={}", x, sum);
        }
    }
}
