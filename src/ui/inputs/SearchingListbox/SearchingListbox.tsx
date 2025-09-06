import { useId, useRef, useState } from 'react';
import classes from './SearchingListbox.module.css'

interface SearchingListboxProps {
    values: { id: string, name: string }[],
    endScrollCallback: () => void,
    selectedValue: { id: string, name: string },
    setSelectedValue: (newValue: { id: string, name: string }) => void,
    searchingString: string,
    setSearchingString: (newValue: string) => void,
    isFocused: boolean,
    setIsFocused: (newValue: boolean) => void,
    scrollIsBlocked: boolean,
    radioName: string,
    label: string,
    placeholder: string
}

const SearchingListbox = ({
    values,
    endScrollCallback,
    selectedValue,
    setSelectedValue,
    searchingString,
    setSearchingString,
    isFocused,
    setIsFocused,
    scrollIsBlocked,
    radioName,
    label,
    placeholder
}: SearchingListboxProps) => {
    const [isScrolledDown, setIsScrolledDown] = useState<boolean>();
    const inputId = useId();
    const radioId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    if (isScrolledDown) {
        endScrollCallback();
        setIsScrolledDown(false);
    }

    const handleScroll = () => {
        if (scrollIsBlocked || !scrollRef || !scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const bottomThreshold = 20;

        if (scrollTop + clientHeight >= scrollHeight - bottomThreshold && !isScrolledDown) {
            setIsScrolledDown(true);
        }
        else if (isScrolledDown) {
            setIsScrolledDown(false)
        }
    };

    return (
        <div onMouseLeave={() => {
            if (!inputRef || !inputRef.current) return;
            setIsFocused(false);
            inputRef.current.blur();
            setSearchingString(selectedValue ? selectedValue.name : "")
        }}>
            <label htmlFor={inputId} className={classes.InputLabel}>{label}</label>
            <input type="text" value={searchingString} onChange={e => setSearchingString(e.target.value)} className={classes.Input} onFocus={() => setIsFocused(true)} ref={inputRef} placeholder={placeholder} id={inputId} />
            <div ref={scrollRef} onScroll={handleScroll} className={classes.Scrollable} style={{ display: isFocused && values.length > 1 ? "block" : "none" }}>
                {
                    values.map(value =>
                        <div key={value.id} className={classes.RadioButton}>
                            <input
                                type='radio'
                                name={radioName}
                                checked={value.id == selectedValue.id}
                                onChange={() => {
                                    if (!inputRef || !inputRef.current) return;
                                    setSelectedValue(value);
                                    setSearchingString(value.name)
                                    setIsFocused(false);
                                    inputRef.current.blur()
                                }}
                                id={radioId + value.id}
                            />
                            <label htmlFor={radioId + value.id} >{value.name}</label>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default SearchingListbox;