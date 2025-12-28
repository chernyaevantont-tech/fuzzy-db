/**
 * Fuzzy Partition utilities for overlapping trapezoidal membership functions (Ruspini partition)
 *
 * For adjacent terms A, B, C with points (a, b, c, d):
 * - A.c = B.a, A.d = B.b (overlap region)
 * - B.c = C.a, B.d = C.b
 * - Constraint: a < b <= c < d (a = c only for triangular terms)
 *
 * This ensures sum of memberships = 1 at every point because:
 * - In overlap region: falling edge of left term + rising edge of right term = 1
 * - In plateau: exactly one term has membership 1
 */

export interface FuzzyTerm {
  a: number;
  b: number;
  c: number;
  d: number;
}

/**
 * Calculate membership value for a single trapezoidal membership function
 *
 * @param x - The input value
 * @param a - Left foot of the trapezoid
 * @param b - Left shoulder of the trapezoid
 * @param c - Right shoulder of the trapezoid
 * @param d - Right foot of the trapezoid
 * @returns Membership value between 0 and 1
 */
export function membershipValue(
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
): number {
  // Outside range (strictly)
  if (x <= a || x >= d) {
    return 0.0;
  }

  // Rising edge (a < x < b)
  if (x < b) {
    return (x - a) / (b - a);
  }

  // Plateau (b <= x <= c)
  if (x <= c) {
    return 1.0;
  }

  // Falling edge (c < x < d)
  return (d - x) / (d - c);
}

/**
 * Calculate sum of membership values at a given point for all terms
 */
export function sumMemberships(terms: FuzzyTerm[], x: number): number {
  return terms.reduce((sum, term) => {
    return sum + membershipValue(x, term.a, term.b, term.c, term.d);
  }, 0);
}

/**
 * Validate a fuzzy partition (Ruspini partition with overlapping terms)
 *
 * A valid partition has:
 * 1. For each term: a < b <= c < d
 * 2. First term starts at range start: first.a < start, first.b = start
 * 3. Last term ends at range end: last.c = end, last.d > end
 * 4. Adjacent terms: prev.c = next.a, prev.d = next.b
 * 5. Sum of memberships = 1 at every point within [start, end]
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateFuzzyPartition(
  terms: FuzzyTerm[],
  start: number,
  end: number,
  tolerance: number = 0.001
): ValidationResult {
  const errors: string[] = [];

  if (terms.length === 0) {
    return { valid: false, errors: ["No terms provided"] };
  }

  // Check constraint a < b <= c < d for each term
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (term.a >= term.b) {
      errors.push(`Term ${i}: a (${term.a}) must be < b (${term.b})`);
    }
    if (term.b > term.c) {
      errors.push(`Term ${i}: b (${term.b}) must be <= c (${term.c})`);
    }
    if (term.c >= term.d) {
      errors.push(`Term ${i}: c (${term.c}) must be < d (${term.d})`);
    }
  }

  // Check first term: b = start (so membership = 1 at start)
  const first = terms[0];
  if (Math.abs(first.b - start) > tolerance) {
    errors.push(`First term's 'b' (${first.b}) should equal start (${start})`);
  }

  // Check last term: c = end (so membership = 1 at end)
  const last = terms[terms.length - 1];
  if (Math.abs(last.c - end) > tolerance) {
    errors.push(`Last term's 'c' (${last.c}) should equal end (${end})`);
  }

  // Check adjacency constraints: prev.c = next.a, prev.d = next.b
  for (let i = 0; i < terms.length - 1; i++) {
    const curr = terms[i];
    const next = terms[i + 1];

    if (Math.abs(curr.c - next.a) > tolerance) {
      errors.push(
        `Term ${i}'s 'c' (${curr.c}) should equal term ${i + 1}'s 'a' (${next.a})`
      );
    }

    if (Math.abs(curr.d - next.b) > tolerance) {
      errors.push(
        `Term ${i}'s 'd' (${curr.d}) should equal term ${i + 1}'s 'b' (${next.b})`
      );
    }
  }

  // Check membership sum at multiple points within [start, end]
  const numSamples = 100;
  for (let i = 0; i <= numSamples; i++) {
    const x = start + ((end - start) * i) / numSamples;
    const sum = sumMemberships(terms, x);

    if (Math.abs(sum - 1.0) > tolerance) {
      errors.push(`Sum of membership values at x=${x.toFixed(4)} is ${sum.toFixed(4)} (expected 1.0)`);
      break; // Only report first failure to avoid flooding
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Synchronize adjacent terms after editing a term
 *
 * This implements the constraints:
 * - prev.c = next.a, prev.d = next.b
 * - First term: b = start (a is slightly before start)
 * - Last term: c = end (d is slightly after end)
 *
 * @param terms - Array of all terms
 * @param editedIndex - Index of the term that was edited (unused, kept for API compatibility)
 * @param start - Start of the parameter range
 * @param end - End of the parameter range
 * @returns New array with synchronized terms
 */
export function synchronizeAdjacentTerms(
  terms: FuzzyTerm[],
  _editedIndex: number,
  start: number,
  end: number
): FuzzyTerm[] {
  const newTerms = terms.map((t) => ({ ...t }));
  const numTerms = newTerms.length;

  if (numTerms === 0) return newTerms;

  // First term: b = start, a slightly before
  const epsilon = (end - start) * 0.001;
  newTerms[0].a = start - epsilon;
  newTerms[0].b = start;

  // Last term: c = end, d slightly after
  newTerms[numTerms - 1].c = end;
  newTerms[numTerms - 1].d = end + epsilon;

  // Synchronize boundaries between adjacent terms: prev.c = next.a, prev.d = next.b
  for (let i = 0; i < numTerms - 1; i++) {
    newTerms[i + 1].a = newTerms[i].c;
    newTerms[i + 1].b = newTerms[i].d;
  }

  return newTerms;
}

/**
 * Create default terms for a new partition (Ruspini-style overlapping)
 *
 * For n terms over range [start, end]:
 * - Each term has a plateau region
 * - Adjacent terms overlap in transition regions
 *
 * @param numTerms - Number of terms to create
 * @param start - Start of the range
 * @param end - End of the range
 * @returns Array of properly overlapping terms
 */
export function createDefaultPartition(
  numTerms: number,
  start: number,
  end: number
): FuzzyTerm[] {
  if (numTerms <= 0) return [];
  
  const range = end - start;
  const epsilon = range * 0.001;
  
  if (numTerms === 1) {
    // Single term covers entire range
    return [{ a: start - epsilon, b: start, c: end, d: end + epsilon }];
  }

  // For n overlapping terms, we need (n-1) overlap regions
  // Total range = sum of plateaus + overlaps
  // Each term has plateau from b to c, overlaps at a-b (left) and c-d (right)
  // 
  // Strategy: place centers evenly, then set overlaps
  // For n terms over [start, end]:
  // - Term i has center at start + (end-start) * i / (n-1) for i=0..n-1
  // - Overlap width is (end-start) / (n-1) / 2
  
  const overlapWidth = range / (numTerms - 1) / 2;
  const terms: FuzzyTerm[] = [];

  for (let i = 0; i < numTerms; i++) {
    const center = start + (range * i) / (numTerms - 1);
    
    let a: number, b: number, c: number, d: number;
    
    if (i === 0) {
      // First term: a < start, b = start, plateau [b, c], overlap at right
      a = start - epsilon;
      b = start;
      c = center; // center = start for first term
      d = center + overlapWidth;
    } else if (i === numTerms - 1) {
      // Last term: overlap at left, plateau [b, c], c = end, d > end
      const prevTerm = terms[i - 1];
      a = prevTerm.c; // prev.c = this.a
      b = prevTerm.d; // prev.d = this.b
      c = end;
      d = end + epsilon;
    } else {
      // Middle terms: overlap at both sides
      const prevTerm = terms[i - 1];
      a = prevTerm.c;
      b = prevTerm.d;
      c = center;
      d = center + overlapWidth;
    }
    
    terms.push({ a, b, c, d });
  }

  return terms;
}

/**
 * Update a term's c and d values and propagate to next term
 */
export function updateTermRightBoundary(
  terms: FuzzyTerm[],
  index: number,
  newC: number,
  newD: number,
  end: number
): FuzzyTerm[] {
  const newTerms = terms.map((t) => ({ ...t }));
  const epsilon = 0.001;
  
  if (index < 0 || index >= newTerms.length) return newTerms;
  
  // Update current term's right boundary
  newTerms[index].c = newC;
  newTerms[index].d = newD;
  
  // If not the last term, propagate to next term: next.a = curr.c, next.b = curr.d
  if (index < newTerms.length - 1) {
    newTerms[index + 1].a = newC;
    newTerms[index + 1].b = newD;
  }
  
  // Last term must end at range end
  if (index === newTerms.length - 1) {
    newTerms[index].c = end;
    newTerms[index].d = end + epsilon;
  }
  
  return newTerms;
}

/**
 * Update a term's a and b values and propagate to previous term
 */
export function updateTermLeftBoundary(
  terms: FuzzyTerm[],
  index: number,
  newA: number,
  newB: number,
  start: number
): FuzzyTerm[] {
  const newTerms = terms.map((t) => ({ ...t }));
  const epsilon = 0.001;
  
  if (index < 0 || index >= newTerms.length) return newTerms;
  
  // Update current term's left boundary
  newTerms[index].a = newA;
  newTerms[index].b = newB;
  
  // If not the first term, propagate to previous term: prev.c = curr.a, prev.d = curr.b
  if (index > 0) {
    newTerms[index - 1].c = newA;
    newTerms[index - 1].d = newB;
  }
  
  // First term must start at range start
  if (index === 0) {
    newTerms[index].a = start - epsilon;
    newTerms[index].b = start;
  }
  
  return newTerms;
}
