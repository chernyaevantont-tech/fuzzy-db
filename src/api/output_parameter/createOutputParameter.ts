import { invoke } from "@tauri-apps/api/core";
import { CreateOutputParameterRequest } from "../../types/output_parameter";

export async function createOutputParameter(
    request: CreateOutputParameterRequest,
    callback: (id: number) => void
): Promise<void> {
    const id = await invoke<number>("create_output_parameter", {
        createRequest: request,
    });
    callback(id);
}
