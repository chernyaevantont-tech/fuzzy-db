import React, { useCallback, useState, useEffect } from 'react';
import { FuzzyOutputValueResponse } from '../../../../types/fuzzy_output_value';
import { updateFuzzyOutputValueById } from '../../../../api/fuzzy_output_value/updateFuzzyOutputValueById';
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
    onMoveUp?: () => void;
    onMoveDown?: () => void;
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
    onMoveUp,
    onMoveDown,
}) => {
    const color = COLORS[index % COLORS.length];
    
    // Локальный стейт для названия терма (строка)
    const [localValue, setLocalValue] = useState(fuzzyOutputValue.value);
    
    // Локальный стейт для чисел (строки для свободного ввода)
    const [localA, setLocalA] = useState(fuzzyOutputValue.a.toFixed(2));
    const [localB, setLocalB] = useState(fuzzyOutputValue.b.toFixed(2));
    const [localC, setLocalC] = useState(fuzzyOutputValue.c.toFixed(2));
    const [localD, setLocalD] = useState(fuzzyOutputValue.d.toFixed(2));
    
    // Отслеживаем ID для синхронизации при переключении термов
    const [prevId, setPrevId] = useState(fuzzyOutputValue.id);
    
    // Синхронизация с props
    useEffect(() => {
        if (fuzzyOutputValue.id !== prevId) {
            // Сменился терм - полная синхронизация
            setLocalValue(fuzzyOutputValue.value);
            setLocalA(fuzzyOutputValue.a.toFixed(2));
            setLocalB(fuzzyOutputValue.b.toFixed(2));
            setLocalC(fuzzyOutputValue.c.toFixed(2));
            setLocalD(fuzzyOutputValue.d.toFixed(2));
            setPrevId(fuzzyOutputValue.id);
        } else {
            // Тот же терм - синхронизируем только числа (для соседних термов)
            // НЕ трогаем localValue, чтобы не сбросить то что пользователь вводит
            setLocalA(fuzzyOutputValue.a.toFixed(2));
            setLocalB(fuzzyOutputValue.b.toFixed(2));
            setLocalC(fuzzyOutputValue.c.toFixed(2));
            setLocalD(fuzzyOutputValue.d.toFixed(2));
        }
    }, [fuzzyOutputValue, prevId]);

    // === ТЕКСТ (название терма) ===
    
    const handleTextChange = useCallback((newValue: string) => {
        setLocalValue(newValue);
        // НЕ сохраняем при вводе, только обновляем локальный стейт
    }, []);
    
    const handleTextBlur = useCallback(() => {
        // Сохраняем только если значение изменилось
        if (localValue !== fuzzyOutputValue.value) {
            const updatedValue = { ...fuzzyOutputValue, value: localValue };
            
            updateFuzzyOutputValueById(fuzzyOutputValue.id, {
                value: localValue,
                a: fuzzyOutputValue.a,
                b: fuzzyOutputValue.b,
                c: fuzzyOutputValue.c,
                d: fuzzyOutputValue.d,
                is_triangle: fuzzyOutputValue.is_triangle,
            }, () => {
                // Обновляем родительский state после успешного сохранения
                onValueChange(updatedValue);
            });
        }
    }, [localValue, fuzzyOutputValue, onValueChange]);
    
    const handleTextKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    }, []);

    // === ЧИСЛА (a, b, c, d) ===
    
    const handleNumberChange = useCallback((param: 'a' | 'b' | 'c' | 'd', valueStr: string) => {
        // Только обновляем локальный стейт для свободного ввода
        if (param === 'a') setLocalA(valueStr);
        else if (param === 'b') setLocalB(valueStr);
        else if (param === 'c') setLocalC(valueStr);
        else if (param === 'd') setLocalD(valueStr);
    }, []);
    
    const handleNumberBlur = useCallback((param: 'a' | 'b' | 'c' | 'd') => {
        const valueStr = param === 'a' ? localA : param === 'b' ? localB : param === 'c' ? localC : localD;
        
        // Валидация - парсим число
        const value = parseFloat(valueStr);
        if (isNaN(value)) {
            // Невалидное число - восстанавливаем из props
            if (param === 'a') setLocalA(fuzzyOutputValue.a.toFixed(2));
            else if (param === 'b') setLocalB(fuzzyOutputValue.b.toFixed(2));
            else if (param === 'c') setLocalC(fuzzyOutputValue.c.toFixed(2));
            else if (param === 'd') setLocalD(fuzzyOutputValue.d.toFixed(2));
            return;
        }
        
        const epsilon = (parameterEnd - parameterStart) * 0.001;
        
        // Ограничиваем диапазоном параметра
        const clampedValue = Math.max(parameterStart, Math.min(parameterEnd, value));
        
        // Создаем обновленный объект
        let newValue = { ...fuzzyOutputValue };
        newValue[param] = clampedValue;

        // Применяем ограничения Ruspini partition
        if (isFirst) {
            // Первый терм: a и b фиксированы на start
            newValue.a = parameterStart;
            newValue.b = parameterStart;
            if (newValue.c < newValue.b) {
                newValue.c = newValue.b;
            }
            if (newValue.d <= newValue.c) {
                newValue.d = newValue.c + epsilon;
            }
        } else if (isLast) {
            // Последний терм: c и d фиксированы на end
            newValue.c = parameterEnd;
            newValue.d = parameterEnd;
            if (newValue.b > newValue.c) {
                newValue.b = newValue.c;
            }
            if (newValue.a >= newValue.b) {
                newValue.a = newValue.b - epsilon;
            }
        } else {
            // Средний терм: все редактируемы, но a < b <= c < d
            if (param === 'a') {
                if (newValue.a >= newValue.b) newValue.b = newValue.a + epsilon;
                if (newValue.b > newValue.c) newValue.c = newValue.b;
                if (newValue.c >= newValue.d) newValue.d = newValue.c + epsilon;
            } else if (param === 'b') {
                if (newValue.b <= newValue.a) newValue.a = newValue.b - epsilon;
                if (newValue.b > newValue.c) newValue.c = newValue.b;
                if (newValue.c >= newValue.d) newValue.d = newValue.c + epsilon;
            } else if (param === 'c') {
                if (newValue.c < newValue.b) newValue.b = newValue.c;
                if (newValue.b <= newValue.a) newValue.a = newValue.b - epsilon;
                if (newValue.c >= newValue.d) newValue.d = newValue.c + epsilon;
            } else if (param === 'd') {
                if (newValue.d <= newValue.c) newValue.c = newValue.d - epsilon;
                if (newValue.c < newValue.b) newValue.b = newValue.c;
                if (newValue.b <= newValue.a) newValue.a = newValue.b - epsilon;
            }
        }

        // Синхронизация с соседними термами (через parent)
        onValueChange(newValue);
        
        // Сохраняем в БД - используем ТЕКУЩЕЕ localValue (не из props!)
        updateFuzzyOutputValueById(fuzzyOutputValue.id, {
            value: localValue,  // <-- актуальное значение из локального стейта
            a: newValue.a,
            b: newValue.b,
            c: newValue.c,
            d: newValue.d,
            is_triangle: fuzzyOutputValue.is_triangle,
        }, () => {
            // Успешно сохранено
        });
    }, [localA, localB, localC, localD, localValue, fuzzyOutputValue, parameterStart, parameterEnd, isFirst, isLast, onValueChange]);

    // Disabled состояния для полей
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
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onBlur={handleTextBlur}
                    onKeyDown={handleTextKeyDown}
                    className={classes.ValueInput}
                />
                <div className={classes.Actions}>
                    {onMoveUp && (
                        <button className={classes.MoveButton} onClick={onMoveUp} title="Переместить вверх">
                            ▲
                        </button>
                    )}
                    {onMoveDown && (
                        <button className={classes.MoveButton} onClick={onMoveDown} title="Переместить вниз">
                            ▼
                        </button>
                    )}
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
                        value={localA}
                        onChange={(e) => handleNumberChange('a', e.target.value)}
                        onBlur={() => handleNumberBlur('a')}
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
                        value={localB}
                        onChange={(e) => handleNumberChange('b', e.target.value)}
                        onBlur={() => handleNumberBlur('b')}
                        className={classes.NumberInput}
                        disabled={bDisabled}
                        title={isFirst ? "Фиксировано (начало диапазона)" : "Начало плато (a < b, редактируемо)"}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>c:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={localC}
                        onChange={(e) => handleNumberChange('c', e.target.value)}
                        onBlur={() => handleNumberBlur('c')}
                        className={classes.NumberInput}
                        disabled={cDisabled}
                        title={isLast ? "Фиксировано (конец диапазона)" : "Конец плато (b ≤ c, редактируемо)"}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>d:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={localD}
                        onChange={(e) => handleNumberChange('d', e.target.value)}
                        onBlur={() => handleNumberBlur('d')}
                        className={classes.NumberInput}
                        disabled={dDisabled}
                        title={isLast ? "Фиксировано (конец диапазона)" : "Правая граница (c < d, = next.b)"}
                    />
                </div>
            </div>
        </div>
    );
};

export default FuzzyOutputValueUnit;
