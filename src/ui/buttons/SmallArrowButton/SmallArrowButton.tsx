import classes from './SmallArrowButton.module.css'

interface SmallArrowButtonProps {
    onClick: () => void,
    className: string
}

const SmallArrowButton = ({ onClick, className } : SmallArrowButtonProps) => {
    return (
        <button onClick={onClick} className={`${classes.Button} ${className}`}>
            <div className={classes.Arrow} />
        </button>
    );
};

export default SmallArrowButton;