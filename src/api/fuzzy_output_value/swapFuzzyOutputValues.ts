import { invoke } from "@tauri-apps/api/core";

export const switchFuzzyOutputValues = async (id1: number, id2: number) => {
    try {
        await invoke("switch_fuzzy_output_values", { id1, id2 });
    } catch (error) {
        console.error("Failed to switch fuzzy output values:", error);
        throw error;
    }
};
