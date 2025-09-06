import { invoke } from "@tauri-apps/api/core";
import { ProblemFullResponse } from "../../types/problem";

export const getFullProblemById = (id: number, getCallback: (value: ProblemFullResponse) => void) => {
    invoke<ProblemFullResponse>("get_full_problem_by_id", {id}).then(resp => getCallback(resp));
}