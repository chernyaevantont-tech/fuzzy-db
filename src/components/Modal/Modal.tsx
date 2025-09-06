import classes from './Modal.module.css'
import { BsX } from 'react-icons/bs';
import ReactDOM from 'react-dom'
import type { ReactNode } from 'react';

interface ModalProps {
    isShown: boolean,
    closeCallback: () => void,
    children: ReactNode,
    className?: string
}

const Modal: React.FC<ModalProps> = ({isShown, closeCallback, children, className}) => {
    if (!isShown) return null;

    return ReactDOM.createPortal(
        <div className = {classes.ModalWrapper} onClick = {closeCallback}>
            <div className = {`${classes.Modal} ${className}`} onClick = {e => e.stopPropagation()}>
                <BsX className = {classes.Cross} onClick = {closeCallback}/>
                {children}
            </div>
        </div>
    , document.body);
};

export default Modal;