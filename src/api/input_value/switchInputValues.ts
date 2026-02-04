import { invoke } from "@tauri-apps/api/core";

export const switchInputValues = (id1: number, id2: number, callback: () => void) => {
    invoke("switch_input_values", { id1, id2 }).then(callback);
}
