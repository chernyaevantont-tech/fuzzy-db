import React from 'react';
import BaseButton from '../BaseButton/BaseButton';
import classes from './AccentButton.module.css'

interface AccentButton {
    onClick?: () => void,
    children?: React.ReactNode,
    icon?: React.ReactNode,
    className?: string,
}

const AccentButton = ({ onClick, children, icon, className }: AccentButton) => {
    return (
        <BaseButton onClick={onClick} icon={icon} className={`${classes.AccentButton} ${className}`}>{children}</BaseButton>
    );
};

export default AccentButton;