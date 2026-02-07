import React, { useEffect, useState } from 'react';
import classes from './ParameterCard.module.css';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import TextBorderedInput from '../../ui/inputs/TextBorderedInput/TextBorderedInput';
import { RxCross2 } from 'react-icons/rx';
import TextInput from '../../ui/inputs/TextInput/TextInput';

interface ParameterCardProps {
    name: string;
    start: number;
    end: number;
    setParameter: (name: string, start: number, end: number) => void;
    removeCallback: () => void;
    children: React.ReactNode;
    switchUpCallback?: () => void;
    switchDownCallback?: () => void;
    canSwitchUp?: boolean;
    canSwitchDown?: boolean;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

const ParameterCard: React.FC<ParameterCardProps> = ({ 
    name, 
    start, 
    end, 
    setParameter, 
    removeCallback, 
    children,
    switchUpCallback,
    switchDownCallback,
    canSwitchUp = false,
    canSwitchDown = false,
    isOpen: externalIsOpen,
    setIsOpen: externalSetIsOpen,
}) => {
    // Используем внешнее состояние если передано, иначе локальное
    const [localIsOpened, setLocalIsOpened] = useState<boolean>(false);
    const isOpened = externalIsOpen !== undefined ? externalIsOpen : localIsOpened;
    const setIsOpened = externalSetIsOpen || setLocalIsOpened;

    const [timerId, setTimerId] = useState<number | null>(null);

    const [currentName, setCurrentName] = useState<string>(name);

    const numberRegex = /^(-?\d*\.?\d*)?$/;

    const [currentStartString, setCurrentStartString] = useState<string>(start.toString());
    const [currentEndString, setCurrentEndString] = useState<string>(end.toString());
    const [isBlocking, setIsBlocking] = useState<boolean>(false);

    const saveNameOnChange = (newName: string) => {
        setCurrentName(newName);
        if (timerId != null) {
            clearTimeout(timerId);
            setTimerId(null);
        }
        setTimerId(setTimeout(() => {
            setParameter(
                newName,
                start,
                end,
            );
        }, 1000));
    }
    const saveNameOnBlur = () => {
        if (timerId != null) {
            clearTimeout(timerId);
            setTimerId(null);
        }
        setParameter(
            currentName,
            start,
            end,
        );
    }

    const saveStartOnChange = (newStartString: string) => {
        setCurrentStartString(newStartString);
        if (timerId != null) {
            clearTimeout(timerId);
            setTimerId(null);
        }

        const start = newStartString.trim() != "" ? Number.parseFloat(newStartString) : 0;
        const end = currentEndString.trim() != "" ? Number.parseFloat(currentEndString) : 0;
        if (start >= end) {
            setIsBlocking(true);
            console.log(start, end, "start blocked")
            return;
        } else if (isBlocking) {
            setIsBlocking(false);
            console.log(start, end, "start unblocked")
        }

        setTimerId(setTimeout(() => {
            setParameter(
                currentName,
                start,
                end,
            );
        }, 1000));
    }
    const saveEndOnChange = (newEndString: string) => {
        setCurrentEndString(newEndString);
        if (timerId != null) {
            clearTimeout(timerId);
            setTimerId(null);
        }

        const start = currentStartString.trim() != "" ? Number.parseFloat(currentStartString) : 0;
        const end = newEndString.trim() != "" ? Number.parseFloat(newEndString) : 0;
        if (start >= end) {
            setIsBlocking(true);
            console.log(start, end, "start blocked")
            return;
        } else if (isBlocking) {
            setIsBlocking(false);
            console.log(start, end, "start unblocked")
        }

        setTimerId(setTimeout(() => {
            setParameter(
                currentName,
                start,
                end,
            );
        }, 1000));
    }
    const saveStartEndOnBlur = () => {
        if (timerId != null) {
            clearTimeout(timerId);
            setTimerId(null);
        }

        const start = currentStartString.trim() != "" ? Number.parseFloat(currentStartString) : 0;
        const end = currentEndString.trim() != "" ? Number.parseFloat(currentEndString) : 0;
        if (start >= end) {
            setIsBlocking(true);
            console.log(start, end, "blur blocked")
            return;
        } else if (isBlocking) {
            setIsBlocking(false);
            console.log(start, end, "stblurart unblocked")
        }

        setParameter(
            currentName,
            start,
            end,
        );
    }

    useEffect(() => {
        console.log("blocking", isBlocking);
    }, [isBlocking])

    // Синхронизация локального состояния с props при их изменении
    useEffect(() => {
        setCurrentName(name);
    }, [name]);

    useEffect(() => {
        setCurrentStartString(start.toString());
    }, [start]);

    useEffect(() => {
        setCurrentEndString(end.toString());
    }, [end]);

    return (
        <div className={classes.ParameterCard}>
            <div className={classes.Top}>
                <div className={classes.Name}>
                    <TextBorderedInput value={currentName} setValue={saveNameOnChange} onBlur={saveNameOnBlur} className={classes.NameInput} />
                </div>
                {(switchUpCallback || switchDownCallback) && (
                    <div className={classes.SwitchButtons}>
                        {canSwitchUp ? (
                            <FaAngleUp className={classes.IconSwitch} onClick={switchUpCallback} title="Переместить вверх" />
                        ) : (
                            <div className={classes.IconSwitch} />
                        )}
                        {canSwitchDown ? (
                            <FaAngleDown className={classes.IconSwitch} onClick={switchDownCallback} title="Переместить вниз" />
                        ) : (
                            <div className={classes.IconSwitch} />
                        )}
                    </div>
                )}
                <RxCross2 className={classes.Icon} onClick={removeCallback} />
                {
                    isOpened ?
                        <FaAngleUp className={classes.Icon} onClick={() => setIsOpened(false)} />
                        :
                        <FaAngleDown className={classes.Icon} onClick={() => setIsOpened(true)} />
                }
            </div>
            <div style={{ display: isOpened ? "block" : "none" }} className={classes.Container}>
                <div className={classes.StartEndContainer}>
                    <TextInput
                        value={currentStartString}
                        setValue={value => {
                            if (numberRegex.test(value)) {
                                saveStartOnChange(value);
                            }
                        }}
                        onBlur={saveStartEndOnBlur}
                        label='Начало'
                        placeholder='0'
                        isWrongBlock={isBlocking}
                        className={classes.Input}
                    />
                    <TextInput
                        value={currentEndString}
                        setValue={value => {
                            if (numberRegex.test(value)) {
                                saveEndOnChange(value);
                            }
                        }}
                        onBlur={saveStartEndOnBlur}
                        label='Конец'
                        placeholder='0'
                        isWrongBlock={isBlocking}
                        className={classes.Input}
                    />
                </div>
                {children}
            </div>
        </div>
    );
};

export default ParameterCard;