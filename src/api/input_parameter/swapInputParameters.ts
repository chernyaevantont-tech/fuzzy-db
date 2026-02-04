import { invoke } from "@tauri-apps/api/core";

export const switchInputParameters = async (id1: number, id2: number) => {
    try {
        await invoke("switch_input_parameters", { id1, id2 });
    } catch (error) {
        console.error("Failed to switch input parameters:", error);
        throw error;
    }
};
