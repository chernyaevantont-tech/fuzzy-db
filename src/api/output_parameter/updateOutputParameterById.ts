import { invoke } from "@tauri-apps/api/core";
import { UpdateOutputParameterRequest } from "../../types/output_parameter";

export async function updateOutputParameterById(
    id: number,
    request: UpdateOutputParameterRequest,
    callback: () => void
): Promise<void> {
    await invoke<void>("update_output_parameter_by_id", {
        id,
        updateRequest: request,
    });
    callback();
}
