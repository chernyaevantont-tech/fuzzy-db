import { invoke } from "@tauri-apps/api/core";

export async function removeFuzzyOutputValueById(
    id: number,
    callback: () => void
): Promise<void> {
    try {
        await invoke<void>("remove_fuzzy_output_value_by_id", { id });
        callback();
    } catch (error) {
        console.error("Failed to remove fuzzy output value:", error);
        throw error;
    }
}
