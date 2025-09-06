import React, { RefObject } from 'react';
import AccentButton from '../../buttons/AccentButton/AccentButton';

interface FileInputProps {
    onChange: (files: FileList | null) => void;
    fileInputRef: RefObject<HTMLInputElement>;
    accept?: string;
    className?: string;
    label?: string;
}

const FileInput: React.FC<FileInputProps> = ({
    onChange,
    fileInputRef,
    accept = '*/*',
    className = '',
    label = 'Выберите файл',
}) => {
    return (
        <AccentButton className={`${className}`} onClick={() => fileInputRef.current?.click()}>
            {label}
            <input type='file' style={{ display: "none" }} ref={fileInputRef} onChange={e => onChange(e.target.files)} accept={accept} />
        </AccentButton>
    );
};

export default FileInput;