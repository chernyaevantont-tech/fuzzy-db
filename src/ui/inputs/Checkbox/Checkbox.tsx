// import classes from './Checkbox.module.css'

interface CheckboxProps {
    id: string,
    value: string,
    onChange: () => void,
    className: string
}
// const Checkbox = ({id, value, onChange, className}: CheckboxProps) => {
//     return (
//         <input type='checkbox' id={id} value={value} onChange={onChange} className={`${classes.Checkbox} ${className}`} style={{backgroundImage: `url(${process.env.PUBLIC_URL}/img/icon-check.png)`}}/>
//     );
// };

// export default Checkbox;