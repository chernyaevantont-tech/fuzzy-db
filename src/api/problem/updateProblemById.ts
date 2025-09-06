import { invoke } from "@tauri-apps/api/core";
import { UpdateProblemRequest } from "../../types/problem";

export const updateProblemById = (id: number, updateRequest: UpdateProblemRequest, updateCallback: () => void) => {
    invoke("update_problem_by_id", {id, updateRequest}).then(updateCallback);
}