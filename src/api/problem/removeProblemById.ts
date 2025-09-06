import { invoke } from "@tauri-apps/api/core"

export const removeProblemById = (id: number, removeCallback: () => void) => {
    invoke("remove_problem_by_id", {id}).then(removeCallback);
}