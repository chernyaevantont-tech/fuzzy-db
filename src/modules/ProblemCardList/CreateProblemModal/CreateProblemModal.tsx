import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import TextInput from '../../../ui/inputs/TextInput/TextInput';
import classes from './CreateProblemModal.module.css';
import TextArea from '../../../ui/inputs/TextArea/TextArea';
import { open, } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import UintArrayImage from '../../../ui/images/UintArrayImage/UintArrayImage';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import SecondaryButton from '../../../ui/buttons/SecondaryButton/SecondaryButton';
import { createProblem } from '../../../api/problem/createProblem';

interface CreateProblemModalProps {
    isShown: boolean;
    prevProblemId: number | null;
    createProblemCallback: (
        id: number,
        name: string,
        description: string,
        isFinal: boolean,
        prevProblemId: number | null,
        imageId: number | null
    ) => void;
    closeCallback: () => void;
}

const CreateProblemModal: React.FC<CreateProblemModalProps> = ({ isShown, prevProblemId, createProblemCallback, closeCallback }) => {
    const [name, setName] = useState<string>("Новая задача");
    const [description, setDescription] = useState<string>("");
    const [uintArrayImage, setUintArrayImage] = useState<Uint8Array>(new Uint8Array);
    const [imageFormat, setImageFormat] = useState<string>("");

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

            setUintArrayImage(contents);

            const splitedPath = imageDir.split('.');
            setImageFormat(splitedPath[splitedPath.length - 1]);
        }
        catch {
            return;
        }
    }

    return (
        <Modal isShown={isShown} closeCallback={closeCallback} className={classes.Modal}>
            <div className={classes.Content}>
                <div className={classes.ContentWrapper}>
                    <div>
                        <UintArrayImage uintArrayImage={uintArrayImage} imageFormat={imageFormat} className={classes.Image} />
                        <div className={classes.ImageButtonsContainer}>
                            <SecondaryButton onClick={() => {
                                setUintArrayImage(new Uint8Array);
                                setImageFormat("");
                            }}>Отмена</SecondaryButton>
                            <AccentButton onClick={getImage}>Выбрать</AccentButton>
                        </div>
                    </div>
                    <div className={classes.InputContainer}>
                        <TextInput value={name} setValue={setName} label='Название' />
                        <TextArea value={description} setValue={setDescription} inputClassName={classes.TextArea} label='Описание' labelColor='var(--panel-color)' />
                    </div>
                </div>
                <div className={classes.ButtonContainer}>
                    <AccentButton onClick={() => createProblem({
                        prev_problem_id: prevProblemId,
                        is_final: false,
                        name: name,
                        description: description,
                        image: imageFormat.trim() !== "" ? {
                            image_data: Array.from(uintArrayImage),
                            image_format: imageFormat,
                        } : null,
                    }, (id, imageId) => {
                        createProblemCallback(id, name, description, false, prevProblemId, imageId);
                        closeCallback();
                    })}>Создать группу</AccentButton>
                    <AccentButton onClick={() => createProblem({
                        prev_problem_id: prevProblemId,
                        is_final: true,
                        name: name,
                        description: description,
                        image: imageFormat.trim() !== "" ? {
                            image_data: Array.from(uintArrayImage),
                            image_format: imageFormat,
                        } : null,
                    }, (id, imageId) => {
                        createProblemCallback(id, name, description, true, prevProblemId, imageId);
                        closeCallback();
                    })}>Создать задачу</AccentButton>
                </div>
            </div>
        </Modal>
    );
};

export default CreateProblemModal;