import React, { useState, useEffect } from 'react';
import classes from './DetailedFuzzyInference.module.css';
import { InputParameterResponse } from '../../types/input_parameter';
import { OutputParameterResponse } from '../../types/output_parameter';
import { getOutputValuesByProblemId } from '../../api/output_value/getOutputValuesByProblemId';
import { OutputValueResponse } from '../../types/output_value';

interface DetailedFuzzyInferenceProps {
    problemId: number;
    inputParameters: InputParameterResponse[];
    outputParameters: OutputParameterResponse[];
}

// Вычисление степени принадлежности для трапециевидной функции
const trapezoidalMembership = (x: number, a: number, b: number, c: number, d: number): number => {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x > c && x < d) return (d - x) / (d - c);
    return 0;
};

// Центроид для дефаззификации
const centroidDefuzzification = (
    fuzzySet: { x: number; mu: number }[]
): number => {
    let numerator = 0;
    let denominator = 0;
    for (const point of fuzzySet) {
        numerator += point.x * point.mu;
        denominator += point.mu;
    }
    return denominator > 0 ? numerator / denominator : 0;
};

const DetailedFuzzyInference: React.FC<DetailedFuzzyInferenceProps> = ({
    problemId,
    inputParameters,
    outputParameters,
}) => {
    const [inputValues, setInputValues] = useState<Record<number, number>>({});
    const [rules, setRules] = useState<OutputValueResponse[]>([]);
    const [showCalculations, setShowCalculations] = useState(false);

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

    const performInference = () => {
        if (inputParameters.length === 0 || outputParameters.length === 0) {
            return null;
        }

        // Шаг 1: Фаззификация входов
        const fuzzificationResults: Record<number, Record<number, number>> = {};
        inputParameters.forEach((param) => {
            const crispValue = inputValues[param.id] || 0;
            fuzzificationResults[param.id] = {};
            param.input_values.forEach((iv) => {
                const mu = trapezoidalMembership(crispValue, iv.a, iv.b, iv.c, iv.d);
                fuzzificationResults[param.id][iv.id] = mu;
            });
        });

        // Шаг 2: Применение правил и агрегация
        const aggregatedOutputs: Record<number, Record<number, number>> = {};
        outputParameters.forEach((outParam) => {
            aggregatedOutputs[outParam.id] = {};
            outParam.fuzzy_output_values.forEach((fov) => {
                aggregatedOutputs[outParam.id][fov.id] = 0;
            });
        });

        const activatedRules: Array<{
            inputCombination: string;
            inputTermIds: number[];
            outputParamId: number;
            outputTermId: number;
            outputTermName: string;
            minMu: number;
        }> = [];

        rules.forEach((rule) => {
            if (!rule.fuzzy_output_value_id) return;
            
            // Parse input_value_ids - format is |1||2||3|
            const inputTermIds = rule.input_value_ids
                .split('|')
                .filter(s => s.trim() !== '')
                .map(Number);
            if (inputTermIds.length !== inputParameters.length) return;

            // Вычисляем минимальную степень принадлежности (AND операция)
            let minMu = 1;
            const inputCombinationParts: string[] = [];
            inputTermIds.forEach((inputValueId, index) => {
                const param = inputParameters[index];
                const mu = fuzzificationResults[param.id][inputValueId] || 0;
                minMu = Math.min(minMu, mu);
                const term = param.input_values.find(iv => iv.id === inputValueId);
                if (term) {
                    inputCombinationParts.push(`${param.name}=${term.value}(${mu.toFixed(3)})`);
                }
            });

            if (minMu > 0) {
                // Находим выходной параметр и терм
                for (const outParam of outputParameters) {
                    const outputTerm = outParam.fuzzy_output_values.find(
                        (fov) => fov.id === rule.fuzzy_output_value_id
                    );
                    if (outputTerm) {
                        aggregatedOutputs[outParam.id][outputTerm.id] = Math.max(
                            aggregatedOutputs[outParam.id][outputTerm.id],
                            minMu
                        );
                        activatedRules.push({
                            inputCombination: inputCombinationParts.join(' AND '),
                            inputTermIds,
                            outputParamId: outParam.id,
                            outputTermId: outputTerm.id,
                            outputTermName: outputTerm.value,
                            minMu,
                        });
                        break;
                    }
                }
            }
        });

        // Шаг 3: Дефаззификация методом центроида
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

        return {
            fuzzificationResults,
            activatedRules,
            aggregatedOutputs,
            crispOutputs,
        };
    };

    const results = showCalculations ? performInference() : null;

    if (inputParameters.length === 0) {
        return (
            <div className={classes.EmptyState}>
                Добавьте входные параметры для выполнения нечёткого вывода
            </div>
        );
    }

    if (outputParameters.length === 0) {
        return (
            <div className={classes.EmptyState}>
                Добавьте выходные параметры для выполнения нечёткого вывода
            </div>
        );
    }

    return (
        <div className={classes.Container}>
            <div className={classes.InputSection}>
                <h3>Входные значения</h3>
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

            <button
                className={classes.CalculateButton}
                onClick={() => setShowCalculations(true)}
            >
                Выполнить нечёткий вывод
            </button>

            {results && (
                <div className={classes.ResultsSection}>
                    <h3>Шаг 1: Фаззификация входных значений</h3>
                    {inputParameters.map((param) => (
                        <div key={param.id} className={classes.Step}>
                            <h4>
                                {param.name} = {inputValues[param.id]?.toFixed(3)}
                            </h4>
                            <div className={classes.MembershipTable}>
                                {param.input_values.map((iv) => {
                                    const mu = results.fuzzificationResults[param.id][iv.id];
                                    return (
                                        <div key={iv.id} className={classes.MembershipRow}>
                                            <span className={classes.Term}>{iv.value}:</span>
                                            <span className={classes.Value}>
                                                μ = {mu.toFixed(3)}
                                            </span>
                                            <span className={classes.Formula}>
                                                trap({inputValues[param.id]?.toFixed(2)}, {iv.a.toFixed(2)}, {iv.b.toFixed(2)}, {iv.c.toFixed(2)}, {iv.d.toFixed(2)})
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <h3>Шаг 2: Применение правил нечётких продукций</h3>
                    <div className={classes.RulesSection}>
                        <p>Активировано правил: {results.activatedRules.length}</p>
                        {results.activatedRules.map((rule, index) => (
                            <div key={index} className={classes.RuleCard}>
                                <div className={classes.RulePremise}>
                                    <strong>Правило {index + 1}:</strong> ЕСЛИ {rule.inputCombination}
                                </div>
                                <div className={classes.RuleConclusion}>
                                    ТО выход = <strong>{rule.outputTermName}</strong>
                                </div>
                                <div className={classes.RuleStrength}>
                                    Сила правила (min): <strong>{rule.minMu.toFixed(3)}</strong>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3>Шаг 3: Агрегация результатов (max)</h3>
                    {outputParameters.map((outParam) => (
                        <div key={outParam.id} className={classes.Step}>
                            <h4>{outParam.name}</h4>
                            <div className={classes.AggregationTable}>
                                {outParam.fuzzy_output_values.map((fov) => {
                                    const strength = results.aggregatedOutputs[outParam.id][fov.id];
                                    return (
                                        <div key={fov.id} className={classes.AggregationRow}>
                                            <span className={classes.Term}>{fov.value}:</span>
                                            <span className={classes.Value}>
                                                μ = {strength.toFixed(3)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <h3>Шаг 4: Дефаззификация (метод центроида)</h3>
                    {outputParameters.map((outParam) => (
                        <div key={outParam.id} className={classes.FinalResult}>
                            <h4>{outParam.name}</h4>
                            <div className={classes.CrispValue}>
                                Чёткое значение: <strong>{results.crispOutputs[outParam.id].toFixed(4)}</strong>
                            </div>
                            <div className={classes.Formula}>
                                Формула центроида: x* = Σ(x·μ(x)) / Σ(μ(x))
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DetailedFuzzyInference;
