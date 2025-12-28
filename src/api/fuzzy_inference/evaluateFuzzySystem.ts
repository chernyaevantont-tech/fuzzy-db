import { invoke } from "@tauri-apps/api/core";
import { EvaluateFuzzySystemRequest, EvaluateFuzzySystemResponse } from "../../types/fuzzy_inference";

export async function evaluateFuzzySystem(
    request: EvaluateFuzzySystemRequest
): Promise<EvaluateFuzzySystemResponse> {
    return await invoke<EvaluateFuzzySystemResponse>("evaluate_fuzzy_system", {
        request,
    });
}
