export type CreateFuzzyOutputValueRequest = {
    output_parameter_id: number;
}

export type UpdateFuzzyOutputValueRequest = {
    value: string;
    a: number;
    b: number;
    c: number;
    d: number;
    is_triangle: boolean;
}

export type FuzzyOutputValueResponse = {
    id: number;
    output_parameter_id: number;
    value: string;
    a: number;
    b: number;
    c: number;
    d: number;
    is_triangle: boolean;
}