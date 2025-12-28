import { invoke } from "@tauri-apps/api/core";

export async function removeOutputParameterById(
    id: number,
    callback: () => void
): Promise<void> {
    await invoke<void>("remove_output_parameter_by_id", { id });
    callback();
}
