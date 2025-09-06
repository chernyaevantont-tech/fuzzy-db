import { invoke } from "@tauri-apps/api/core"

export const removeInputParameterById = (id: number,  removeCallback: () => void) => {
    invoke("remove_input_parameter_by_id", {id}).then(removeCallback);
}