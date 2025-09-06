import { invoke } from "@tauri-apps/api/core";
import { CreateInputValueRequest } from "../../types/input_value";

export const createInputValue = (createRequest: CreateInputValueRequest, createCallback: (id: number) => void) => {
    invoke<number>("create_input_value", {createRequest}).then(resp => createCallback(resp));
}