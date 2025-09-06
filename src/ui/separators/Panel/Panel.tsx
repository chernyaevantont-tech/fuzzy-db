import React, { ReactNode } from 'react';
import classes from './Panel.module.css'

interface PanelProps {
    children? : ReactNode;
    className? : string;
}

const Panel: React.FC<PanelProps> = ({children, className}) => {
    return (
        <div className={`${classes.Panel} ${className}`}>
            {children}
        </div>
    );
};

export default Panel;