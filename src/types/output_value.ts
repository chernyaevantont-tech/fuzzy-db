export type UpdateOutputValueRequest = {
    fuzzy_output_value_id : number | null;
}

export type OutputValueResponse = {
    id: number;
    output_parameter_od: number;
    fuzzy_output_value_id: number | null;
    input_value_ids: string;
}