import { invoke } from "@tauri-apps/api/core";

export const switchOutputParameters = (id1: number, id2: number, callback: () => void) => {
    invoke("switch_output_parameters", { id1, id2 }).then(callback);
}
