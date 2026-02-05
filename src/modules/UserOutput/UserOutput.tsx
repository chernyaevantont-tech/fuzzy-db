import React, { useState, useEffect } from 'react';
import classes from './UserOutput.module.css';
import { InputParameterResponse } from '../../types/input_parameter';
import { OutputParameterResponse } from '../../types/output_parameter';
import { getOutputValuesByProblemId } from '../../api/output_value/getOutputValuesByProblemId';
import { OutputValueResponse } from '../../types/output_value';

interface UserOutputProps {
    problemId: number;
    inputParameters: InputParameterResponse[];
    outputParameters: OutputParameterResponse[];
}

const trapezoidalMembership = (x: number, a: number, b: number, c: number, d: number): number => {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
};

const centroidDefuzzification = (fuzzySet: { x: number; mu: number }[]): number => {
    let numerator = 0;
    let denominator = 0;
    for (const point of fuzzySet) {
        numerator += point.x * point.mu;
        denominator += point.mu;
    }
    return denominator > 0 ? numerator / denominator : 0;
};

const UserOutput: React.FC<UserOutputProps> = ({
    problemId,
    inputParameters,
    outputParameters,
}) => {
    const [inputValues, setInputValues] = useState<Record<number, number>>({});
    const [rules, setRules] = useState<OutputValueResponse[]>([]);
    const [results, setResults] = useState<Record<number, number> | null>(null);

    useEffect(() => {
        const initialValues: Record<number, number> = {};
        inputParameters.forEach((param) => {
            initialValues[param.id] = (param.start + param.end) / 2;
        });
        setInputValues(initialValues);
    }, [inputParameters]);

    useEffect(() => {
        const loadRules = async () => {
            try {
                const outputValues = await getOutputValuesByProblemId(problemId);
                setRules(outputValues);
            } catch (error) {
                console.error('Failed to load rules:', error);
            }
        };
        loadRules();
    }, [problemId]);

    const handleInputChange = (paramId: number, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setInputValues((prev) => ({ ...prev, [paramId]: numValue }));
        }
    };

    const calculate = () => {
        if (inputParameters.length === 0 || outputParameters.length === 0) {
            return;
        }

        const fuzzificationResults: Record<number, Record<number, number>> = {};
        inputParameters.forEach((param) => {
            const crispValue = inputValues[param.id] || 0;
            fuzzificationResults[param.id] = {};
            param.input_values.forEach((iv) => {
                const mu = trapezoidalMembership(crispValue, iv.a, iv.b, iv.c, iv.d);
                fuzzificationResults[param.id][iv.id] = mu;
            });
        });

        const aggregatedOutputs: Record<number, Record<number, number>> = {};
        outputParameters.forEach((outParam) => {
            aggregatedOutputs[outParam.id] = {};
            outParam.fuzzy_output_values.forEach((fov) => {
                aggregatedOutputs[outParam.id][fov.id] = 0;
            });
        });

        rules.forEach((rule) => {
            if (!rule.fuzzy_output_value_id) return;
            
            // Парсим input_value_ids с учетом формата |id1||id2||id3|
            const inputTermIds = rule.input_value_ids
                .split('|')
                .filter(s => s.length > 0)
                .map(Number);
            
            if (inputTermIds.length !== inputParameters.length) return;

            let minMu = 1;
            
            // Для каждого параметра находим соответствующий терм из правила
            for (const param of inputParameters) {
                // Находим ID терма из правила, который принадлежит этому параметру
                let foundTermId: number | null = null;
                for (const termId of inputTermIds) {
                    if (param.input_values.some(iv => iv.id === termId)) {
                        foundTermId = termId;
                        break;
                    }
                }
                
                if (foundTermId === null) {
                    // Не нашли терм для этого параметра - правило не применимо
                    minMu = 0;
                    break;
                }
                
                const mu = fuzzificationResults[param.id][foundTermId] || 0;
                minMu = Math.min(minMu, mu);
            }

            if (minMu > 0) {
                for (const outParam of outputParameters) {
                    const outputTerm = outParam.fuzzy_output_values.find(
                        (fov) => fov.id === rule.fuzzy_output_value_id
                    );
                    if (outputTerm) {
                        aggregatedOutputs[outParam.id][outputTerm.id] = Math.max(
                            aggregatedOutputs[outParam.id][outputTerm.id],
                            minMu
                        );
                        break;
                    }
                }
            }
        });

        const crispOutputs: Record<number, number> = {};
        outputParameters.forEach((outParam) => {
            const fuzzySet: { x: number; mu: number }[] = [];
            const resolution = 100;
            const step = (outParam.end - outParam.start) / resolution;

            for (let x = outParam.start; x <= outParam.end; x += step) {
                let mu = 0;
                outParam.fuzzy_output_values.forEach((fov) => {
                    const ruleStrength = aggregatedOutputs[outParam.id][fov.id] || 0;
                    const termMu = trapezoidalMembership(x, fov.a, fov.b, fov.c, fov.d);
                    const clippedMu = Math.min(ruleStrength, termMu);
                    mu = Math.max(mu, clippedMu);
                });
                fuzzySet.push({ x, mu });
            }

            crispOutputs[outParam.id] = centroidDefuzzification(fuzzySet);
        });

        setResults(crispOutputs);
    };

    if (inputParameters.length === 0) {
        return (
            <div className={classes.EmptyState}>
                Добавьте входные параметры
            </div>
        );
    }

    if (outputParameters.length === 0) {
        return (
            <div className={classes.EmptyState}>
                Добавьте выходные параметры
            </div>
        );
    }

    return (
        <div className={classes.Container}>
            <div className={classes.InputSection}>
                <h3>Введите значения входных параметров</h3>
                <div className={classes.InputGrid}>
                    {inputParameters.map((param) => (
                        <div key={param.id} className={classes.InputCard}>
                            <label>{param.name}</label>
                            <span className={classes.Range}>
                                [{param.start.toFixed(2)}, {param.end.toFixed(2)}]
                            </span>
                            <input
                                type="number"
                                value={inputValues[param.id] ?? ''}
                                onChange={(e) => handleInputChange(param.id, e.target.value)}
                                min={param.start}
                                max={param.end}
                                step={(param.end - param.start) / 100}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button className={classes.CalculateButton} onClick={calculate}>
                Рассчитать
            </button>

            {results && (
                <div className={classes.ResultsSection}>
                    <h3>Результаты</h3>
                    <div className={classes.OutputGrid}>
                        {outputParameters.map((param) => (
                            <div key={param.id} className={classes.OutputCard}>
                                <span className={classes.OutputName}>{param.name}</span>
                                <span className={classes.OutputValue}>
                                    {results[param.id].toFixed(4)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserOutput;
