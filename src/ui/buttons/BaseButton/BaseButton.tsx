import React from 'react';
import classes from './BaseButton.module.css'

interface BaseButton {
    onClick?: () => void,
    children?: React.ReactNode,
    icon?: React.ReactNode,
    className?: string,
}

const BaseButton = ({ onClick, children, icon, className }: BaseButton) => {
    return (
        <button onClick={onClick} className={`${classes.BaseButton} ${className}`}>
            <div className={classes.ContentWrapper}>
                {
                    icon ?
                        <div className={classes.IconWrapper}>
                            {icon}
                        </div>
                        : <></>
                }
                {children}
            </div>
        </button>
    );
};

export default BaseButton;