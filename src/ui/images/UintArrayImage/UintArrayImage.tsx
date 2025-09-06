import React from 'react';
import classes from './UintArrayImage.module.css';
import { CiImageOn } from 'react-icons/ci';

interface UintArrayImageProps {
    uintArrayImage: Uint8Array;
    imageFormat: string;
    className?: string;
}

const UintArrayImage: React.FC<UintArrayImageProps> = ({
    uintArrayImage,
    imageFormat,
    className,
}) => {
    return (<>
        {
            imageFormat != "" ?
                <div style={{
                    backgroundImage:
                        `
            url(data:image/${imageFormat};base64,${btoa(new Uint8Array(uintArrayImage).reduce(function (data, byte) {
                            return data + String.fromCharCode(byte);
                        }, ''))
                        })
            `
                }} className={`${classes.ImageContainer} ${className}`} />
                :
                <div className={`${classes.ImagePlaceholder} ${className}`}>
                    <CiImageOn className={classes.ImageIcon}/>
                </div>
        }
    </>
    );
};

export default UintArrayImage;