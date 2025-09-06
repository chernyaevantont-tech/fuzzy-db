import { invoke } from "@tauri-apps/api/core";
import { CreateProblemRequest, CreateProblemResponse } from "../../types/problem";

export const createProblem = (createRequest: CreateProblemRequest, createCallback: (id: number, imageId: number | null) => void) => {
    invoke<CreateProblemResponse>("create_problem", { createRequest }).then((resp) => createCallback(resp.id, resp.image_id));
}