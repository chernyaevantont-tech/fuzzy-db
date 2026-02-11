export type ExportedProblem = {
    name: string;
    description: string;
    is_final: boolean;
    image: { data: number[]; format: string } | null;
    input_parameters: ExportedInputParameter[];
    output_parameters: ExportedOutputParameter[];
    output_values: ExportedOutputValue[];
    children: ExportedProblem[];
}

export type ExportedInputParameter = {
    temp_id: number;
    name: string;
    start: number;
    end: number;
    values: ExportedInputValue[];
}

export type ExportedInputValue = {
    temp_id: number;
    value: string;
    a: number;
    b: number;
    c: number;
    d: number;
    is_triangle: boolean;
}

export type ExportedOutputParameter = {
    temp_id: number;
    name: string;
    start: number;
    end: number;
    values: ExportedFuzzyOutputValue[];
}

export type ExportedFuzzyOutputValue = {
    temp_id: number;
    value: string;
    a: number;
    b: number;
    c: number;
    d: number;
    is_triangle: boolean;
}

export type ExportedOutputValue = {
    output_parameter_temp_id: number;
    fuzzy_output_value_temp_id: number | null;
    input_value_temp_ids: number[];
}
