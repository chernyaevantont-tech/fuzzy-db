import { invoke } from "@tauri-apps/api/core";

export const removeInputValueById = async (id: number, removeCallback: () => void) => {
    try {
        await invoke<void>("remove_input_value_by_id", { id });
        removeCallback();
    } catch (error) {
        console.error("Failed to remove input value:", error);
        throw error;
    }
}
