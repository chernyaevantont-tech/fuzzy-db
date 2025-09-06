import React from 'react';
import BaseButton from '../BaseButton/BaseButton';
import classes from './SecondaryButton.module.css'

interface SecondaryButtonProps {
    onClick?: () => void, 
    children?: React.ReactNode,
    icon?: React.ReactNode,
    className?: string,
}

const SecondaryButton = ({ onClick, children, icon, className }: SecondaryButtonProps) => {
    return (
        <BaseButton onClick={onClick} icon={icon} className={`${classes.SecondaryButton} ${className}`}>{children}</BaseButton>
    );
};

export default SecondaryButton;