import { invoke } from "@tauri-apps/api/core";
import { ImageResponse } from "../../types/image";

export const getImageById = (id: number, getCallback: (value: ImageResponse) => void) => {
    invoke<ImageResponse>("get_image_by_id", { id }).then(resp => getCallback(resp));
}