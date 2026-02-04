import { invoke } from "@tauri-apps/api/core";

export const switchFuzzyOutputValues = (id1: number, id2: number, callback: () => void) => {
    invoke("switch_fuzzy_output_values", { id1, id2 }).then(callback);
}
