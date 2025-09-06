import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import classes from './TipContainer.module.css';
import { createPortal } from 'react-dom';

export enum TipPosition {
    Top,
    Right,
    Bottom,
    Left
}

type TipContainerProps = {
    tip: string;
    tipPosition: TipPosition;
    tipPadding: number;
    children: ReactNode;
    className?: string;
}

const TipContainer: React.FC<TipContainerProps> = ({ tip, tipPosition, tipPadding, children, className }) => {
    const [isShown, setIsShown] = useState<boolean>(true);
    const [timerId, setTimerId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const [tipWidth, setTipWidth] = useState<number>(0);
    const [tipHeight, setTipHeight] = useState<number>(0);

    const handleMouseEnter = () => {
        setTimerId(setTimeout(() => {
            setIsShown(true);
            setTimerId(null);
        }, 1000));
    }

    const handleMouseLeave = () => {
        if (timerId) {
            clearTimeout(timerId);
            setTimerId(null);
            setIsShown(false);
        }
        else {
            setIsShown(false);
        }
    }

    useEffect(() => {
        if (!tipRef.current) return;

        setTipWidth(tipRef.current?.getBoundingClientRect().width || 0);
        setTipHeight(tipRef.current?.getBoundingClientRect().height || 0);

        setIsShown(false)
    }, []);

    const getTipStyle = useCallback(() => {
        switch (tipPosition) {
            case TipPosition.Top:
                return {
                    display: isShown ? "block" : "none",
                    top: (containerRef.current?.getBoundingClientRect().top || 0) - tipHeight - tipPadding,
                    left: (containerRef.current?.getBoundingClientRect().left || 0) - tipWidth / 2
                }
            case TipPosition.Bottom:
                return {
                    display: isShown ? "block" : "none",
                    top: containerRef.current?.getBoundingClientRect().bottom || 0 + tipPadding,
                    left: (containerRef.current?.getBoundingClientRect().left || 0) - tipWidth / 2
                }
            case TipPosition.Left:
                return {
                    display: isShown ? "block" : "none",
                    top: containerRef.current?.getBoundingClientRect().top,
                    left: (containerRef.current?.getBoundingClientRect().left || 0) - tipWidth - tipPadding
                }
            case TipPosition.Right:
                return {
                    display: isShown ? "block" : "none",
                    top: (containerRef.current?.getBoundingClientRect().bottom || 0),
                    left: (containerRef.current?.getBoundingClientRect().left || 0) + tipPadding
                }
        }
    }, [tipWidth, tipHeight, isShown])

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`${classes.TipContainer} ${className || ""}`}
            ref={containerRef}
        >
            {children}
            {createPortal(
                <div className={classes.Tip} ref={tipRef} style={
                    getTipStyle()
                }>
                    {tip}
                </div>, document.body
            )}

        </div>
    );
};


export default TipContainer;