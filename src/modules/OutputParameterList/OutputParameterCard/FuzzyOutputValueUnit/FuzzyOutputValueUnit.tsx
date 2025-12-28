import React, { useCallback } from 'react';
import { FuzzyOutputValueResponse } from '../../../../types/fuzzy_output_value';
import TextInput from '../../../../ui/inputs/TextInput/TextInput';
import classes from './FuzzyOutputValueUnit.module.css';

// Color palette - should match FuzzyGraph
const COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
    '#1abc9c', '#e91e63', '#00bcd4', '#ff5722', '#8bc34a',
];

interface FuzzyOutputValueUnitProps {
    fuzzyOutputValue: FuzzyOutputValueResponse;
    index: number;
    parameterStart: number;
    parameterEnd: number;
    isFirst: boolean;
    isLast: boolean;
    onValueChange: (updated: FuzzyOutputValueResponse) => void;
    onDelete: () => void;
}

const FuzzyOutputValueUnit: React.FC<FuzzyOutputValueUnitProps> = ({
    fuzzyOutputValue,
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
        onValueChange({ ...fuzzyOutputValue, value });
    }, [fuzzyOutputValue, onValueChange]);

    const handleNumberChange = useCallback((param: 'a' | 'b' | 'c' | 'd', valueStr: string) => {
        const value = parseFloat(valueStr);
        if (isNaN(value)) return;
        
        // Clamp to parameter range
        const clampedValue = Math.max(parameterStart, Math.min(parameterEnd, value));
        
        let newValue = { ...fuzzyOutputValue };
        newValue[param] = clampedValue;

        // Enforce constraints: a <= b <= c <= d (only within this term)
        if (param === 'a') {
            // For first term, a and b are fixed to start, so skip
            if (!isFirst) {
                if (newValue.a > newValue.c) newValue.c = newValue.a;
                if (newValue.c > newValue.d) newValue.d = newValue.c;
            }
        } else if (param === 'c') {
            if (newValue.c < newValue.a) newValue.a = newValue.c;
            // For last term, c and d are fixed to end, so skip d adjustment
            if (!isLast) {
                if (newValue.c > newValue.d) newValue.d = newValue.c;
            }
        } else if (param === 'd') {
            // For last term, c and d are fixed to end
            if (!isLast) {
                if (newValue.d < newValue.c) newValue.c = newValue.d;
                if (newValue.c < newValue.a) newValue.a = newValue.c;
            }
        }

        onValueChange(newValue);
    }, [fuzzyOutputValue, parameterStart, parameterEnd, isFirst, isLast, onValueChange]);

    // For first term: a and b are fixed to parameterStart (both disabled)
    // For last term: c and d are fixed to parameterEnd (both disabled)
    // For middle terms: a and b are synced with prev.d, c and d are synced with next.a
    const aDisabled = isFirst;
    const bDisabled = isFirst;
    const cDisabled = isLast;
    const dDisabled = isLast;

    return (
        <div className={classes.Container}>
            <div className={classes.Top}>
                <div
                    className={classes.ColorIndicator}
                    style={{ backgroundColor: color }}
                />
                <TextInput
                    value={fuzzyOutputValue.value}
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
                        min={parameterStart}
                        max={parameterEnd}
                        value={fuzzyOutputValue.a.toFixed(2)}
                        onChange={(e) => handleNumberChange('a', e.target.value)}
                        className={classes.NumberInput}
                        disabled={aDisabled}
                        title={aDisabled ? "Фиксировано к началу диапазона" : "Синхронизируется с предыдущим термом"}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>b:</span>
                    <input
                        type="number"
                        step="0.01"
                        min={parameterStart}
                        max={parameterEnd}
                        value={fuzzyOutputValue.b.toFixed(2)}
                        onChange={(e) => handleNumberChange('b', e.target.value)}
                        className={classes.NumberInput}
                        disabled={bDisabled}
                        title={bDisabled ? "Фиксировано к началу диапазона" : "Синхронизируется с предыдущим термом"}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>c:</span>
                    <input
                        type="number"
                        step="0.01"
                        min={parameterStart}
                        max={parameterEnd}
                        value={fuzzyOutputValue.c.toFixed(2)}
                        onChange={(e) => handleNumberChange('c', e.target.value)}
                        className={classes.NumberInput}
                        disabled={cDisabled}
                        title={cDisabled ? "Фиксировано к концу диапазона" : ""}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>d:</span>
                    <input
                        type="number"
                        step="0.01"
                        min={parameterStart}
                        max={parameterEnd}
                        value={fuzzyOutputValue.d.toFixed(2)}
                        onChange={(e) => handleNumberChange('d', e.target.value)}
                        className={classes.NumberInput}
                        disabled={dDisabled}
                        title={dDisabled ? "Фиксировано к концу диапазона" : ""}
                    />
                </div>
            </div>
        </div>
    );
};

export default FuzzyOutputValueUnit;
