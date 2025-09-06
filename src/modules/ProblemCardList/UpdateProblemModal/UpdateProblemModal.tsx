import React, { useEffect, useState } from 'react';
import { UpdateProblemRequest } from '../../../types/problem';
import classes from './UpdateProblemModal.module.css';
import { UpdateImageRequest } from '../../../types/image';
import { getImageById } from '../../../api/image/getImageById';
import UintArrayImage from '../../../ui/images/UintArrayImage/UintArrayImage';
import SecondaryButton from '../../../ui/buttons/SecondaryButton/SecondaryButton';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import TextInput from '../../../ui/inputs/TextInput/TextInput';
import TextArea from '../../../ui/inputs/TextArea/TextArea';
import { updateProblemById } from '../../../api/problem/updateProblemById';

interface UpdateProblemModalProps {
    id: number;
    name: string;
    description: string;
    imageId: number | null;
    uintArrayImage: Uint8Array;
    imageFormat: string;
    updateProblemCallback: (
        id: number,
        name: string,
        description: string
    ) => void;
    updateImageCallback: (
        id: number,
        uintArrayImage: Uint8Array,
        imageFormat: string,
    ) => void;
    closeCallback: () => void;
}

const UpdateProblemModal: React.FC<UpdateProblemModalProps> = ({
    id,
    name,
    description,
    imageId,
    uintArrayImage,
    imageFormat,
    updateProblemCallback,
    updateImageCallback,
    closeCallback
}) => {
    const [updateRequest, setUpdateRequest] = useState<UpdateProblemRequest>({ name: name, description: description });
    const [updateImageRequest, setUpdateImageRequest] = useState<{ uintArrayImage: Uint8Array, imageFormat: string } | null>(null);

    const getImage = async () => {
        try {
            const imageDir = await open({
                filters: [{
                    name: 'Image',
                    extensions: ['jpg', 'jpeg']
                }]
            })

            if (!imageDir) return;

            const contents = await readFile(imageDir);

            const splitedPath = imageDir.split('.');

            setUpdateImageRequest({ uintArrayImage: contents, imageFormat: splitedPath[splitedPath.length - 1] });
        }
        catch {
            return;
        }
    }

    return (
        <div className={classes.Content}>
            <div className={classes.ContentWrapper}>
                <div>
                    <UintArrayImage
                        uintArrayImage={
                            updateImageRequest ?
                                updateImageRequest.uintArrayImage
                                : uintArrayImage
                        }
                        imageFormat={
                            updateImageRequest ?
                                updateImageRequest.imageFormat
                                : imageFormat
                        }
                        className={classes.Image}
                    />
                    <div className={classes.ImageButtonsContainer}>
                        <SecondaryButton onClick={() => {
                            setUpdateImageRequest(null);
                        }}>Отмена</SecondaryButton>
                        <AccentButton onClick={() => {
                            setUpdateImageRequest({ uintArrayImage: new Uint8Array, imageFormat: "" });
                        }}>Удалить</AccentButton>
                        <AccentButton onClick={() => {
                            getImage();
                        }}>Выбрать</AccentButton>
                    </div>
                </div>
                <div className={classes.InputContainer}>
                    <TextInput
                        value={updateRequest.name}
                        setValue={(value: string) => setUpdateRequest({ ...updateRequest, name: value })}
                        label='Название'
                    />
                    <TextArea
                        value={updateRequest.description}
                        setValue={(value: string) => setUpdateRequest({ ...updateRequest, name: value })}
                        inputClassName={classes.TextArea}
                        label='Описание'
                        labelColor='var(--panel-color)'
                    />
                </div>
                <div className={classes.ButtonContainer}>
                    <AccentButton onClick={() => updateProblemById(
                        id,
                        updateRequest,
                        () => {
                            updateProblemCallback(id, updateRequest.name, updateRequest.description);
                            closeCallback();
                        })}>Изменить</AccentButton>
                </div>
            </div>
        </div>
    );
};

export default UpdateProblemModal;