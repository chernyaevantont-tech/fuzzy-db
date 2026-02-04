import { invoke } from "@tauri-apps/api/core";

export const switchInputParameters = (id1: number, id2: number, callback: () => void) => {
    invoke("switch_input_parameters", { id1, id2 }).then(callback);
}
