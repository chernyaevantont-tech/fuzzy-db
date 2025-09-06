import { CreateImageRequest } from "./image";
import { InputParameterResponse } from "./input_parameter";
import { OutputParameterResponse } from "./output_parameter";
import { OutputValueResponse } from "./output_value";

export type ProblemResponse = {
    id: number;
    prev_problem_id: number | null;
    is_final: boolean;
    name: string;
    description: string;
    image_id: number | null;
    created_at: string;
    updated_at: string;
}

export type ProblemFullResponse = {
    id: number;
    prev_problem_id: number | null;
    is_final: boolean;
    name: string;
    description: string;
    image_id: number | null;
    created_at: string;
    updated_at: string;
    input_parameters: Array<InputParameterResponse>;
    output_parameters: Array<OutputParameterResponse>;
    output_values: Array<OutputValueResponse>;
}

export type CreateProblemRequest = {
    prev_problem_id: number | null;
    is_final: boolean;
    name: string;
    description: string;
    image: CreateImageRequest | null;
}

export type CreateProblemResponse = {
    id: number;
    image_id: number | null;
}

export type UpdateProblemRequest = {
    name: string;
    description: string;
}