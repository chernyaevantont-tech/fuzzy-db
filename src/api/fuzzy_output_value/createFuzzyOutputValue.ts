import { invoke } from "@tauri-apps/api/core";
import { CreateFuzzyOutputValueRequest } from "../../types/fuzzy_output_value";

export async function createFuzzyOutputValue(
    request: CreateFuzzyOutputValueRequest,
    callback: (id: number) => void
): Promise<void> {
    const id = await invoke<number>("create_fuzzy_output_value", {
        createRequest: request,
    });
    callback(id);
}
