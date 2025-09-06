import React, { ReactNode, useEffect, useRef } from 'react';

interface DropdownMenuProps {
    className?: string;
    buttonClassName: string;
    buttonContent: ReactNode;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    children: ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ className, buttonClassName, buttonContent, isOpen, setIsOpen, children }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={className} ref={dropdownRef}>
            <button className={buttonClassName} onClick={() => setIsOpen(!isOpen)}>
                {buttonContent}
            </button>
            {
                isOpen && children
            }
        </div>
    );
};

export default DropdownMenu;