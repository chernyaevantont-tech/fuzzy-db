export type CreateInputValueRequest = {
    input_parameter_id: number;
}

export type UpdateInputValueRequest = {
    value: string;
    a: number;
    b: number;
    c: number;
    d: number;
    is_triangle: boolean;
}

export type InputValueResponse = {
    id: number;
    input_parameter_id: number;
    value: string;
    a: number;
    b: number;
    c: number;
    d: number;
    is_triangle: boolean;
}