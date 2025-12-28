import React, { useCallback, useMemo } from 'react';
import { InputValueResponse } from '../../../../types/input_value';
import TextInput from '../../../../ui/inputs/TextInput/TextInput';
import classes from './InputValueUnit.module.css';

// Color palette - should match FuzzyGraph
const COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
    '#1abc9c', '#e91e63', '#00bcd4', '#ff5722', '#8bc34a',
];

/**
 * Validate constraint: a < b <= c < d for overlapping Ruspini partition
 */
function validateTermConstraints(a: number, b: number, c: number, d: number): boolean {
    return a < b && b <= c && c < d;
}

interface InputValueUnitProps {
    inputValue: InputValueResponse;
    index: number;
    parameterStart: number;
    parameterEnd: number;
    isFirst: boolean;
    isLast: boolean;
    onValueChange: (updated: InputValueResponse, editedParam?: 'a' | 'b' | 'c' | 'd') => void;
    onDelete: () => void;
}

const InputValueUnit: React.FC<InputValueUnitProps> = ({
    inputValue,
    index,
    parameterStart,
    parameterEnd,
    isFirst,
    isLast,
    onValueChange,
    onDelete,
}) => {
    const color = COLORS[index % COLORS.length];

    const handleTextChange = useCallback((value: string) => {
        onValueChange({ ...inputValue, value });
    }, [inputValue, onValueChange]);

    /**
     * Handle number input change with Ruspini partition constraints:
     * - a < b <= c < d (always enforced within this term)
     * - Changes propagate to adjacent terms via parent
     * 
     * Editable fields:
     * - First term: b, c, d (a is fixed to start - epsilon)
     * - Middle terms: a, b, c, d (all editable, synced with neighbors)
     * - Last term: a, b, c (d is fixed to end + epsilon)
     */
    const handleNumberChange = useCallback((param: 'a' | 'b' | 'c' | 'd', valueStr: string) => {
        const value = parseFloat(valueStr);
        if (isNaN(value)) return;
        
        const epsilon = (parameterEnd - parameterStart) * 0.001;
        
        // Clamp to reasonable range
        let clampedValue = Math.max(parameterStart - epsilon * 10, Math.min(parameterEnd + epsilon * 10, value));
        
        let newValue = { ...inputValue };
        newValue[param] = clampedValue;

        // Enforce constraint within this term: a < b <= c < d
        // Adjust adjacent values to maintain validity
        if (param === 'a') {
            // a changed: ensure a < b
            if (newValue.a >= newValue.b) {
                newValue.b = newValue.a + epsilon;
            }
            // Cascade: if b > c, adjust c
            if (newValue.b > newValue.c) {
                newValue.c = newValue.b;
            }
            // Cascade: if c >= d, adjust d
            if (newValue.c >= newValue.d) {
                newValue.d = newValue.c + epsilon;
            }
        } else if (param === 'b') {
            // b changed: ensure a < b <= c
            if (newValue.b <= newValue.a) {
                newValue.a = newValue.b - epsilon;
            }
            if (newValue.b > newValue.c) {
                newValue.c = newValue.b;
            }
            // Cascade: if c >= d, adjust d
            if (newValue.c >= newValue.d) {
                newValue.d = newValue.c + epsilon;
            }
        } else if (param === 'c') {
            // c changed: ensure b <= c < d
            if (newValue.c < newValue.b) {
                newValue.b = newValue.c;
            }
            // Cascade: if b <= a, adjust a
            if (newValue.b <= newValue.a) {
                newValue.a = newValue.b - epsilon;
            }
            if (newValue.c >= newValue.d) {
                newValue.d = newValue.c + epsilon;
            }
        } else if (param === 'd') {
            // d changed: ensure c < d
            if (newValue.d <= newValue.c) {
                newValue.c = newValue.d - epsilon;
            }
            // Cascade: if c < b, adjust b
            if (newValue.c < newValue.b) {
                newValue.b = newValue.c;
            }
            // Cascade: if b <= a, adjust a
            if (newValue.b <= newValue.a) {
                newValue.a = newValue.b - epsilon;
            }
        }

        // Send to parent with info about which param was edited
        onValueChange(newValue, param);
    }, [inputValue, parameterStart, parameterEnd, onValueChange]);

    // Overlapping Ruspini partition:
    // Only first term's 'a' and last term's 'd' are fixed (disabled)
    // All other points are editable and sync with adjacent terms
    const aDisabled = isFirst;  // First term: a is fixed to start - epsilon
    const bDisabled = false;    // Always editable
    const cDisabled = false;    // Always editable  
    const dDisabled = isLast;   // Last term: d is fixed to end + epsilon

    // Validation state for visual feedback
    const isValid = useMemo(() => {
        return validateTermConstraints(inputValue.a, inputValue.b, inputValue.c, inputValue.d);
    }, [inputValue.a, inputValue.b, inputValue.c, inputValue.d]);

    return (
        <div className={`${classes.Container} ${!isValid ? classes.Invalid : ''}`}>
            <div className={classes.Top}>
                <div
                    className={classes.ColorIndicator}
                    style={{ backgroundColor: color }}
                />
                <TextInput
                    value={inputValue.value}
                    setValue={handleTextChange}
                    className={classes.Value}
                />
                <div className={classes.Actions}>
                    <button className={classes.DeleteButton} onClick={onDelete} title="Удалить">
                        ✕
                    </button>
                </div>
            </div>
            <div className={classes.Parameters}>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>a:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue.a.toFixed(2)}
                        onChange={(e) => handleNumberChange('a', e.target.value)}
                        className={classes.NumberInput}
                        disabled={aDisabled}
                        title={isFirst ? "Фиксировано (начало диапазона)" : "Левая граница (= prev.c)"}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>b:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue.b.toFixed(2)}
                        onChange={(e) => handleNumberChange('b', e.target.value)}
                        className={classes.NumberInput}
                        disabled={bDisabled}
                        title="Начало плато (a < b, = prev.d)"
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>c:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue.c.toFixed(2)}
                        onChange={(e) => handleNumberChange('c', e.target.value)}
                        className={classes.NumberInput}
                        disabled={cDisabled}
                        title="Конец плато (b ≤ c, = next.a)"
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>d:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue.d.toFixed(2)}
                        onChange={(e) => handleNumberChange('d', e.target.value)}
                        className={classes.NumberInput}
                        disabled={dDisabled}
                        title={isLast ? "Фиксировано (конец диапазона)" : "Правая граница (c < d, = next.b)"}
                    />
                </div>
            </div>
        </div>
    );
};

export default InputValueUnit;