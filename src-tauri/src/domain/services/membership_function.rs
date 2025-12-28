/// Calculates the membership degree μ(x) for a trapezoidal or triangular membership function.
///
/// Trapezoidal function parameters (a, b, c, d):
/// ```text
///        ___________
///       /           \
///      /             \
/// ____/               \____
///    a    b       c    d
/// ```
///
/// For triangular functions: b ≈ c (or is_triangle = true, then b = c)
///
/// # Arguments
/// * `x` - The crisp input value
/// * `a` - Left foot of the trapezoid
/// * `b` - Left shoulder of the trapezoid
/// * `c` - Right shoulder of the trapezoid
/// * `d` - Right foot of the trapezoid
/// * `is_triangle` - Whether this is a triangular function (uses b as peak)
///
/// # Returns
/// Membership degree in range [0.0, 1.0]
pub fn calculate_membership(x: f32, a: f32, b: f32, c: f32, d: f32, is_triangle: bool) -> f32 {
    let (b, c) = if is_triangle { (b, b) } else { (b, c) };

    if x <= a {
        0.0
    } else if x < b {
        // Rising edge
        (x - a) / (b - a)
    } else if x <= c {
        // Plateau (or peak for triangle)
        1.0
    } else if x < d {
        // Falling edge
        (d - x) / (d - c)
    } else {
        0.0
    }
}

/// Calculates the membership degree for special edge cases (left-most and right-most functions).
///
/// Left-most function: plateau from start to b, then falling edge to d
/// Right-most function: rising edge from a to b, then plateau to end
///
/// # Arguments
/// * `x` - The crisp input value
/// * `a` - Left foot of the trapezoid
/// * `b` - Left shoulder of the trapezoid
/// * `c` - Right shoulder of the trapezoid
/// * `d` - Right foot of the trapezoid
/// * `is_left_edge` - If true, extends plateau to the left
/// * `is_right_edge` - If true, extends plateau to the right
///
/// # Returns
/// Membership degree in range [0.0, 1.0]
pub fn calculate_membership_with_edges(
    x: f32,
    a: f32,
    b: f32,
    c: f32,
    d: f32,
    is_triangle: bool,
    is_left_edge: bool,
    is_right_edge: bool,
) -> f32 {
    let (b, c) = if is_triangle { (b, b) } else { (b, c) };

    if is_left_edge && x <= c {
        1.0
    } else if is_right_edge && x >= b {
        1.0
    } else {
        calculate_membership(x, a, b, c, d, false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_trapezoidal_membership() {
        // Test trapezoid with a=0, b=2, c=4, d=6
        assert_eq!(calculate_membership(-1.0, 0.0, 2.0, 4.0, 6.0, false), 0.0);
        assert_eq!(calculate_membership(0.0, 0.0, 2.0, 4.0, 6.0, false), 0.0);
        assert_eq!(calculate_membership(1.0, 0.0, 2.0, 4.0, 6.0, false), 0.5);
        assert_eq!(calculate_membership(2.0, 0.0, 2.0, 4.0, 6.0, false), 1.0);
        assert_eq!(calculate_membership(3.0, 0.0, 2.0, 4.0, 6.0, false), 1.0);
        assert_eq!(calculate_membership(4.0, 0.0, 2.0, 4.0, 6.0, false), 1.0);
        assert_eq!(calculate_membership(5.0, 0.0, 2.0, 4.0, 6.0, false), 0.5);
        assert_eq!(calculate_membership(6.0, 0.0, 2.0, 4.0, 6.0, false), 0.0);
        assert_eq!(calculate_membership(7.0, 0.0, 2.0, 4.0, 6.0, false), 0.0);
    }

    #[test]
    fn test_triangular_membership() {
        // Test triangle with a=0, b=3, c=3, d=6
        assert_eq!(calculate_membership(0.0, 0.0, 3.0, 3.0, 6.0, true), 0.0);
        assert_eq!(calculate_membership(1.5, 0.0, 3.0, 3.0, 6.0, true), 0.5);
        assert_eq!(calculate_membership(3.0, 0.0, 3.0, 3.0, 6.0, true), 1.0);
        assert_eq!(calculate_membership(4.5, 0.0, 3.0, 3.0, 6.0, true), 0.5);
        assert_eq!(calculate_membership(6.0, 0.0, 3.0, 3.0, 6.0, true), 0.0);
    }

    #[test]
    fn test_edge_cases() {
        // Left edge: should be 1.0 for all x <= c
        assert_eq!(
            calculate_membership_with_edges(0.0, 0.0, 2.0, 4.0, 6.0, false, true, false),
            1.0
        );
        assert_eq!(
            calculate_membership_with_edges(4.0, 0.0, 2.0, 4.0, 6.0, false, true, false),
            1.0
        );
        assert_eq!(
            calculate_membership_with_edges(5.0, 0.0, 2.0, 4.0, 6.0, false, true, false),
            0.5
        );

        // Right edge: should be 1.0 for all x >= b
        assert_eq!(
            calculate_membership_with_edges(2.0, 0.0, 2.0, 4.0, 6.0, false, false, true),
            1.0
        );
        assert_eq!(
            calculate_membership_with_edges(6.0, 0.0, 2.0, 4.0, 6.0, false, false, true),
            1.0
        );
        assert_eq!(
            calculate_membership_with_edges(1.0, 0.0, 2.0, 4.0, 6.0, false, false, true),
            0.5
        );
    }
}
