import classes from './RadioButton.module.css'

interface RadioButton {
    name: string,
    id: string,
    label: string,
    checked: boolean,
    onChange: () => void,
    className: string
}

const RadioButton = ({name, id, label, checked, onChange, className} : RadioButton) => {
    return (
        <div className={className}>
            <input type='radio' name={name} id = {id} onChange = {onChange} checked = {checked} className={classes.RadioButton}/>
            <label htmlFor={id} className={classes.Label}>{label}</label>
        </div>
    );
};

export default RadioButton;