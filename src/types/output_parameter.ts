import { FuzzyOutputValueResponse } from "./fuzzy_output_value";

export type CreateOutputParameterRequest = {
    problem_id: number;
}

export type UpdateOutputParameterRequest = {
    name: string;
    start: number;
    end: number;
}

export type OutputParameterResponse = {
    id: number;
    problem_id: number;
    name: string;
    start: number;
    end: number;
    fuzzy_output_values: Array<FuzzyOutputValueResponse>;
}