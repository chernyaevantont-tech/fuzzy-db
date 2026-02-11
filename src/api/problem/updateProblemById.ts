import { invoke } from "@tauri-apps/api/core";
import { UpdateProblemRequest } from "../../types/problem";

export const updateProblemById = (id: number, updateRequest: UpdateProblemRequest, updateCallback: (imageId: number | null) => void) => {
    invoke<number | null>("update_problem_by_id", {id, updateRequest}).then(updateCallback);
}