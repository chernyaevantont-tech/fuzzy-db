export type CreateImageRequest = {
    image_data: Array<number>;
    image_format: string;
}

export type UpdateImageRequest = {
    image_data: Array<number>;
    image_format: string;
}

export type ImageResponse = {
    id: number;
    image_data: Array<number>;
    image_format: string;
}