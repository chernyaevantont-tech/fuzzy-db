import { invoke } from "@tauri-apps/api/core";
import { UpdateInputParameterRequest } from "../../types/input_parameter";

export const updateInputParameterById = (id: number, updateRequest: UpdateInputParameterRequest, updateCallback: () => void) => {
    invoke("update_input_parameter_by_id", {id, updateRequest}).then(updateCallback);
}