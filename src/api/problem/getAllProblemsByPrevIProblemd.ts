import { invoke } from "@tauri-apps/api/core"
import { ProblemResponse } from "../../types/problem"

export const getAllProblemsByPrevProblemId = (prevProblemId: number | null, getCallback: (value: Array<ProblemResponse>) => void ) => {
    invoke<Array<ProblemResponse>>("get_all_problems_by_prev_problem_id", {prevProblemId}).then(resp => {getCallback(resp);});
}