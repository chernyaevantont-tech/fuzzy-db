import { invoke } from "@tauri-apps/api/core";

export const switchInputValues = async (id1: number, id2: number) => {
    try {
        await invoke("switch_input_values", { id1, id2 });
    } catch (error) {
        console.error("Failed to switch input values:", error);
        throw error;
    }
};
