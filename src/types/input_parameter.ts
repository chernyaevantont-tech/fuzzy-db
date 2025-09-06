import { InputValueResponse } from "./input_value";

export type CreateInputParameterRequest = {
    problem_id: number;
}

export type UpdateInputParameterRequest = {
    name: string;
    start: number;
    end: number;
}

export type InputParameterResponse = {
    id: number;
    problem_id: number;
    name: string;
    start: number;
    end: number;
    input_values: Array<InputValueResponse>;
}