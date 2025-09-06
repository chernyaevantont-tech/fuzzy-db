import { invoke } from "@tauri-apps/api/core";
import { CreateInputParameterRequest } from "../../types/input_parameter";

export const createInputParameter = (createRequest: CreateInputParameterRequest, createCallback: (id: number) => void) => {
    invoke<number>("create_input_parameter", {createRequest}).then((resp) => createCallback(resp));
}