import React, { useEffect, useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import TextInput from '../../../ui/inputs/TextInput/TextInput';
import classes from './EditProblemModal.module.css';
import TextArea from '../../../ui/inputs/TextArea/TextArea';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import SecondaryButton from '../../../ui/buttons/SecondaryButton/SecondaryButton';
import { updateProblemById } from '../../../api/problem/updateProblemById';
import { ProblemResponse, ImageUpdateAction } from '../../../types/problem';
import { getImageById } from '../../../api/image/getImageById';
import UintArrayImage from '../../../ui/images/UintArrayImage/UintArrayImage';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

interface EditProblemModalProps {
    isShown: boolean;
    problem: ProblemResponse | null;
    editProblemCallback: (
        id: number,
        name: string,
        description: string,
        imageId: number | null
    ) => void;
    closeCallback: () => void;
}

const EditProblemModal: React.FC<EditProblemModalProps> = ({ isShown, problem, editProblemCallback, closeCallback }) => {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [originalImage, setOriginalImage] = useState<{ data: Uint8Array, format: string } | null>(null);
    const [image, setImage] = useState<{ data: Uint8Array, format: string } | null>(null);
    const [imageStatus, setImageStatus] = useState<'original' | 'changed' | 'deleted'>('original');

    useEffect(() => {
        if (problem) {
            setName(problem.name);
            setDescription(problem.description);
            setImageStatus('original');
            if (problem.image_id) {
                getImageById(problem.image_id, (resp) => {
                    const img = {
                        data: Uint8Array.from(resp.image_data),
                        format: resp.image_format
                    };
                    setOriginalImage(img);
                    setImage(img);
                    setImageStatus('original');
                });
            } else {
                setOriginalImage(null);
                setImage(null);
                setImageStatus('original');
            }
        }
    }, [problem]);

    const handleSelectImage = async () => {
        try {
            const file = await open({
                multiple: false,
                filters: [{
                    name: 'Image',
                    extensions: ['png', 'jpg', 'jpeg']
                }]
            });
            if (file) {
                 const content = await readFile(file);
                 const format = file.split('.').pop() || 'png';
                 setImage({
                     data: content,
                     format: format
                 });
                 setImageStatus('changed');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteSavedImage = () => {
        setImage(null);
        setImageStatus('deleted');
    };

    const handleResetImage = () => {
        setImage(originalImage);
        setImageStatus('original');
    }

    return (
        <Modal isShown={isShown} closeCallback={closeCallback} className={classes.Modal}>
            <div className={classes.Content}>
                <div className={classes.ContentWrapper}>
                    <div className={classes.ImageSection}>
                        <UintArrayImage uintArrayImage={image?.data ?? new Uint8Array} imageFormat={image?.format ?? ""} className={classes.Image} />
                        <div className={classes.ImageButtonsContainer}>
                            <SecondaryButton onClick={handleResetImage}>Сбросить</SecondaryButton>
                            <SecondaryButton onClick={handleDeleteSavedImage}>Удалить</SecondaryButton>
                            <AccentButton onClick={handleSelectImage}>Выбрать</AccentButton>
                        </div>
                    </div>
                    <div className={classes.InputContainer}>
                        <TextInput value={name} setValue={setName} label='Название' />
                        <TextArea value={description} setValue={setDescription} inputClassName={classes.TextArea} label='Описание' labelColor='var(--panel-color)' />
                    </div>
                </div>
                <div className={classes.ButtonContainer}>
                    <AccentButton onClick={() => {
                        if (problem) {
                            let imageAction: ImageUpdateAction = { type: 'no_change' };
                            if (imageStatus === 'deleted') {
                                imageAction = { type: 'delete' };
                            } else if (imageStatus === 'changed' && image) {
                                imageAction = { 
                                    type: 'set', 
                                    data: {
                                        image_data: Array.from(image.data),
                                        image_format: image.format
                                    }
                                };
                            }

                            updateProblemById(problem.id, {
                                name: name,
                                description: description,
                                image_update: imageAction,
                            }, (newImageId) => {
                                editProblemCallback(problem.id, name, description, newImageId);
                                closeCallback();
                            });
                        }
                    }}>Сохранить</AccentButton>
                </div>
            </div>
        </Modal>
    );
};

export default EditProblemModal;