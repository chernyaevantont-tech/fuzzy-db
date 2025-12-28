import { describe, it, expect } from "vitest";
import {
  membershipValue,
  sumMemberships,
  validateFuzzyPartition,
  synchronizeAdjacentTerms,
  createDefaultPartition,
  updateTermRightBoundary,
  updateTermLeftBoundary,
  FuzzyTerm,
} from "./fuzzyPartition";

const TOLERANCE = 0.001;

describe("membershipValue", () => {
  it("returns 0 for values outside range (strictly)", () => {
    // Term: a=0.2, b=0.3, c=0.5, d=0.6
    expect(membershipValue(0.2, 0.2, 0.3, 0.5, 0.6)).toBe(0); // x = a
    expect(membershipValue(0.6, 0.2, 0.3, 0.5, 0.6)).toBe(0); // x = d
    expect(membershipValue(0.1, 0.2, 0.3, 0.5, 0.6)).toBe(0); // x < a
    expect(membershipValue(0.7, 0.2, 0.3, 0.5, 0.6)).toBe(0); // x > d
  });

  it("returns correct value on rising edge", () => {
    // x = 0.25 is in the rising edge between a=0.2 and b=0.3
    const value = membershipValue(0.25, 0.2, 0.3, 0.5, 0.6);
    expect(Math.abs(value - 0.5)).toBeLessThan(TOLERANCE);
  });

  it("returns 1 in plateau region", () => {
    // x = 0.4 is in the plateau between b=0.3 and c=0.5
    expect(membershipValue(0.4, 0.2, 0.3, 0.5, 0.6)).toBe(1);
    // x = b (start of plateau)
    expect(membershipValue(0.3, 0.2, 0.3, 0.5, 0.6)).toBe(1);
    // x = c (end of plateau)
    expect(membershipValue(0.5, 0.2, 0.3, 0.5, 0.6)).toBe(1);
  });

  it("returns correct value on falling edge", () => {
    // x = 0.55 is in the falling edge between c=0.5 and d=0.6
    const value = membershipValue(0.55, 0.2, 0.3, 0.5, 0.6);
    expect(Math.abs(value - 0.5)).toBeLessThan(TOLERANCE);
  });

  it("handles triangular term (b = c)", () => {
    // Triangular: a=0.2, b=0.4, c=0.4, d=0.6
    expect(membershipValue(0.4, 0.2, 0.4, 0.4, 0.6)).toBe(1); // peak
    expect(Math.abs(membershipValue(0.3, 0.2, 0.4, 0.4, 0.6) - 0.5)).toBeLessThan(TOLERANCE); // rising
    expect(Math.abs(membershipValue(0.5, 0.2, 0.4, 0.4, 0.6) - 0.5)).toBeLessThan(TOLERANCE); // falling
  });
});

describe("sumMemberships - overlapping terms", () => {
  it("returns 1 in overlap region", () => {
    // Two overlapping terms:
    // Term 1: a=-0.01, b=0, c=0.5, d=0.7
    // Term 2: a=0.5, b=0.7, c=1, d=1.01
    // Overlap at [0.5, 0.7]: term1 falling + term2 rising = 1
    const terms: FuzzyTerm[] = [
      { a: -0.01, b: 0, c: 0.5, d: 0.7 },
      { a: 0.5, b: 0.7, c: 1, d: 1.01 },
    ];

    // At x=0.6 (middle of overlap): 
    // term1: (0.7-0.6)/(0.7-0.5) = 0.1/0.2 = 0.5
    // term2: (0.6-0.5)/(0.7-0.5) = 0.1/0.2 = 0.5
    const sum = sumMemberships(terms, 0.6);
    expect(Math.abs(sum - 1)).toBeLessThan(TOLERANCE);
  });

  it("returns 1 in plateau region", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.01, b: 0, c: 0.5, d: 0.7 },
      { a: 0.5, b: 0.7, c: 1, d: 1.01 },
    ];

    // At x=0.3 (in term1 plateau, before overlap)
    expect(Math.abs(sumMemberships(terms, 0.3) - 1)).toBeLessThan(TOLERANCE);
    // At x=0.85 (in term2 plateau, after overlap)
    expect(Math.abs(sumMemberships(terms, 0.85) - 1)).toBeLessThan(TOLERANCE);
  });

  it("returns 1 at all points for 3-term partition", () => {
    // Three overlapping terms A, B, C
    // A: a=-0.01, b=0, c=0.3, d=0.5
    // B: a=0.3, b=0.5, c=0.7, d=0.9 (A.c=B.a, A.d=B.b)
    // C: a=0.7, b=0.9, c=1, d=1.01 (B.c=C.a, B.d=C.b)
    const terms: FuzzyTerm[] = [
      { a: -0.01, b: 0, c: 0.3, d: 0.5 },
      { a: 0.3, b: 0.5, c: 0.7, d: 0.9 },
      { a: 0.7, b: 0.9, c: 1, d: 1.01 },
    ];

    // Test at various points
    for (const x of [0.1, 0.2, 0.4, 0.5, 0.6, 0.8, 0.95]) {
      const sum = sumMemberships(terms, x);
      expect(
        Math.abs(sum - 1),
        `Sum at x=${x} should be 1, got ${sum}`
      ).toBeLessThan(TOLERANCE);
    }
  });
});

describe("validateFuzzyPartition", () => {
  it("validates single term partition", () => {
    const terms: FuzzyTerm[] = [{ a: -0.001, b: 0, c: 1, d: 1.001 }];
    const result = validateFuzzyPartition(terms, 0, 1);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates two term overlapping partition", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.001, b: 0, c: 0.5, d: 0.7 },
      { a: 0.5, b: 0.7, c: 1, d: 1.001 },
    ];
    const result = validateFuzzyPartition(terms, 0, 1);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates three term overlapping partition", () => {
    // A.c=B.a, A.d=B.b, B.c=C.a, B.d=C.b
    const terms: FuzzyTerm[] = [
      { a: -0.001, b: 0, c: 0.3, d: 0.5 },
      { a: 0.3, b: 0.5, c: 0.7, d: 0.9 },
      { a: 0.7, b: 0.9, c: 1, d: 1.001 },
    ];
    const result = validateFuzzyPartition(terms, 0, 1);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects constraint violation: a >= b", () => {
    const terms: FuzzyTerm[] = [
      { a: 0.1, b: 0, c: 1, d: 1.001 }, // a > b - invalid
    ];
    const result = validateFuzzyPartition(terms, 0, 1);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("must be < b"))).toBe(true);
  });

  it("detects constraint violation: b > c", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.001, b: 0.6, c: 0.4, d: 1.001 }, // b > c - invalid
    ];
    const result = validateFuzzyPartition(terms, 0, 1);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("must be <= c"))).toBe(true);
  });

  it("detects constraint violation: c >= d", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.001, b: 0, c: 1.001, d: 1 }, // c > d - invalid
    ];
    const result = validateFuzzyPartition(terms, 0, 1);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("must be < d"))).toBe(true);
  });

  it("detects wrong adjacency: prev.c != next.a", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.001, b: 0, c: 0.4, d: 0.6 },
      { a: 0.5, b: 0.6, c: 1, d: 1.001 }, // a != prev.c
    ];
    const result = validateFuzzyPartition(terms, 0, 1);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("'c'") && e.includes("'a'"))).toBe(true);
  });

  it("detects wrong adjacency: prev.d != next.b", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.001, b: 0, c: 0.5, d: 0.6 },
      { a: 0.5, b: 0.7, c: 1, d: 1.001 }, // b != prev.d
    ];
    const result = validateFuzzyPartition(terms, 0, 1);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("'d'") && e.includes("'b'"))).toBe(true);
  });

  it("rejects empty terms", () => {
    const result = validateFuzzyPartition([], 0, 1);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("No terms provided");
  });
});

describe("synchronizeAdjacentTerms", () => {
  it("sets first term b = start", () => {
    const terms: FuzzyTerm[] = [
      { a: 0.1, b: 0.2, c: 0.5, d: 0.7 },
      { a: 0.5, b: 0.7, c: 1, d: 1.1 },
    ];
    const synced = synchronizeAdjacentTerms(terms, 0, 0, 1);
    expect(synced[0].b).toBe(0);
    expect(synced[0].a).toBeLessThan(0); // a < b
  });

  it("sets last term c = end", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.1, b: 0, c: 0.5, d: 0.7 },
      { a: 0.5, b: 0.7, c: 0.9, d: 1.0 },
    ];
    const synced = synchronizeAdjacentTerms(terms, 1, 0, 1);
    expect(synced[1].c).toBe(1);
    expect(synced[1].d).toBeGreaterThan(1); // d > c
  });

  it("propagates next.a = prev.c and next.b = prev.d", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.1, b: 0, c: 0.4, d: 0.6 },
      { a: 0.5, b: 0.8, c: 1, d: 1.1 }, // wrong adjacency
    ];
    const synced = synchronizeAdjacentTerms(terms, 0, 0, 1);
    expect(synced[1].a).toBe(synced[0].c);
    expect(synced[1].b).toBe(synced[0].d);
  });

  it("produces valid partition after sync", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.1, b: 0, c: 0.35, d: 0.55 },
      { a: 0.35, b: 0.55, c: 0.65, d: 0.85 },
      { a: 0.65, b: 0.85, c: 1, d: 1.1 },
    ];
    const synced = synchronizeAdjacentTerms(terms, 1, 0, 1);
    const result = validateFuzzyPartition(synced, 0, 1);
    expect(result.valid).toBe(true);
  });
});

describe("createDefaultPartition", () => {
  it("creates single term correctly", () => {
    const terms = createDefaultPartition(1, 0, 1);
    expect(terms).toHaveLength(1);
    expect(terms[0].b).toBe(0);
    expect(terms[0].c).toBe(1);
    expect(terms[0].a).toBeLessThan(0);
    expect(terms[0].d).toBeGreaterThan(1);
  });

  it("creates two terms with proper overlap", () => {
    const terms = createDefaultPartition(2, 0, 1);
    expect(terms).toHaveLength(2);
    // Check adjacency: term0.c = term1.a, term0.d = term1.b
    expect(terms[0].c).toBe(terms[1].a);
    expect(terms[0].d).toBe(terms[1].b);
    // First term starts at 0
    expect(terms[0].b).toBe(0);
    // Last term ends at 1
    expect(terms[1].c).toBe(1);
  });

  it("creates valid partition for any number of terms", () => {
    for (const n of [1, 2, 3, 4, 5]) {
      const terms = createDefaultPartition(n, 0, 1);
      const result = validateFuzzyPartition(terms, 0, 1);
      expect(result.valid, `${n} terms should be valid: ${result.errors.join(", ")}`).toBe(true);
    }
  });

  it("creates valid partition with non-zero range", () => {
    const terms = createDefaultPartition(3, 10, 100);
    const result = validateFuzzyPartition(terms, 10, 100);
    expect(result.valid).toBe(true);
  });

  it("handles zero terms", () => {
    const terms = createDefaultPartition(0, 0, 1);
    expect(terms).toHaveLength(0);
  });
});

describe("updateTermRightBoundary", () => {
  it("updates current term and propagates to next", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.01, b: 0, c: 0.5, d: 0.7 },
      { a: 0.5, b: 0.7, c: 1, d: 1.01 },
    ];
    const updated = updateTermRightBoundary(terms, 0, 0.4, 0.6, 1);
    expect(updated[0].c).toBe(0.4);
    expect(updated[0].d).toBe(0.6);
    expect(updated[1].a).toBe(0.4);
    expect(updated[1].b).toBe(0.6);
  });
});

describe("updateTermLeftBoundary", () => {
  it("updates current term and propagates to previous", () => {
    const terms: FuzzyTerm[] = [
      { a: -0.01, b: 0, c: 0.5, d: 0.7 },
      { a: 0.5, b: 0.7, c: 1, d: 1.01 },
    ];
    const updated = updateTermLeftBoundary(terms, 1, 0.4, 0.6, 0);
    expect(updated[1].a).toBe(0.4);
    expect(updated[1].b).toBe(0.6);
    expect(updated[0].c).toBe(0.4);
    expect(updated[0].d).toBe(0.6);
  });
});

describe("Integration: sum equals 1 everywhere", () => {
  it("sum equals 1 at 1000 points for 2-term partition", () => {
    const terms = createDefaultPartition(2, 0, 1);

    for (let i = 0; i <= 1000; i++) {
      const x = i / 1000;
      const sum = sumMemberships(terms, x);
      expect(
        Math.abs(sum - 1),
        `Sum at x=${x} should be 1, got ${sum}`
      ).toBeLessThan(TOLERANCE);
    }
  });

  it("sum equals 1 at 1000 points for 5-term partition", () => {
    const terms = createDefaultPartition(5, 0, 1);

    for (let i = 0; i <= 1000; i++) {
      const x = i / 1000;
      const sum = sumMemberships(terms, x);
      expect(
        Math.abs(sum - 1),
        `Sum at x=${x} should be 1, got ${sum}`
      ).toBeLessThan(TOLERANCE);
    }
  });

  it("sum equals 1 for arbitrary partition range", () => {
    const start = 15;
    const end = 85;
    const terms = createDefaultPartition(4, start, end);

    for (let i = 0; i <= 100; i++) {
      const x = start + ((end - start) * i) / 100;
      const sum = sumMemberships(terms, x);
      expect(
        Math.abs(sum - 1),
        `Sum at x=${x} should be 1, got ${sum}`
      ).toBeLessThan(TOLERANCE);
    }
  });
});
