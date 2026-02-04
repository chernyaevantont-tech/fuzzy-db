import { invoke } from "@tauri-apps/api/core";
import { OutputValueResponse } from "../../types/output_value";

export const getOutputValuesByProblemId = async (
    problemId: number
): Promise<OutputValueResponse[]> => {
    try {
        const response = await invoke<OutputValueResponse[]>("get_output_values_by_problem_id", {
            problemId
        });
        return response;
    } catch (error) {
        console.error("Failed to get output values:", error);
        throw error;
    }
};
