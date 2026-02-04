import { invoke } from "@tauri-apps/api/core";

export const switchOutputParameters = async (id1: number, id2: number) => {
    try {
        await invoke("switch_output_parameters", { id1, id2 });
    } catch (error) {
        console.error("Failed to switch output parameters:", error);
        throw error;
    }
};
