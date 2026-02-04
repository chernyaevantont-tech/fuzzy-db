import { invoke } from "@tauri-apps/api/core";
import { OutputValueResponse } from "../../types/output_value";

export const createOutputValue = async (
    outputParameterId: number,
    inputValueIds: string,
    onSuccess?: (id: number) => void
) => {
    try {
        const response: OutputValueResponse = await invoke("create_output_value", {
            outputParameterId,
            inputValueIds
        });
        onSuccess?.(response.id);
        return response;
    } catch (error) {
        console.error("Failed to create output value:", error);
        throw error;
    }
};
