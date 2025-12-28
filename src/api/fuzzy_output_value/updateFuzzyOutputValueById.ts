import { invoke } from "@tauri-apps/api/core";
import { UpdateFuzzyOutputValueRequest } from "../../types/fuzzy_output_value";

export async function updateFuzzyOutputValueById(
    id: number,
    request: UpdateFuzzyOutputValueRequest,
    callback: () => void
): Promise<void> {
    await invoke<void>("update_fuzzy_output_value_by_id", {
        id,
        updateRequest: request,
    });
    callback();
}
