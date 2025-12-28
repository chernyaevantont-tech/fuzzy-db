import { invoke } from "@tauri-apps/api/core";
import { UpdateInputValueRequest } from "../../types/input_value";

export const updateInputValueById = (
    id: number,
    updateRequest: UpdateInputValueRequest,
    updateCallback: () => void
) => {
    invoke<void>("update_input_value_by_id", { id, updateRequest }).then(() =>
        updateCallback()
    );
};
