import { invoke } from "@tauri-apps/api/core";
import { UpdateOutputValueRequest } from "../../types/output_value";

export const updateOutputValueById = async (
    id: number,
    fuzzy_output_value_id: number | null
) => {
    try {
        await invoke("update_output_value_by_id", {
            id,
            request: {
                fuzzy_output_value_id
            } as UpdateOutputValueRequest
        });
    } catch (error) {
        console.error("Failed to update output value:", error);
        throw error;
    }
};
