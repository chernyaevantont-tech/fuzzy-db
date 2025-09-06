import classes from './Listbox.module.css'

interface ListboxProps {
    selectOptions: {value: string, name: string}[],
    placeholder?: string,
    value: string,
    setValue: (newValue: string) => void,
    id: string,
    className: string
}

const Listbox = ({selectOptions, placeholder, value, setValue, id, className} : ListboxProps) => {
    return (
        <select value={value} onChange={e => {setValue(e.target.value)}} id={id} className={`${classes.Listbox} ${className}`}>
            {
                placeholder ? <option style={{display: "none"}} selected defaultChecked value={""} disabled>{placeholder}</option> : <></>
            }
            {
                selectOptions.map(element => 
                    <option value={element.value}>{element.name}</option>
                )
            }
        </select>
    );
};

export default Listbox;