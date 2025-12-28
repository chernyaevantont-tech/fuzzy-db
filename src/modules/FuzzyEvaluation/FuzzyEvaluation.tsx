import React, { useState, useEffect } from 'react';
import classes from './FuzzyEvaluation.module.css';
import { evaluateFuzzySystem } from '../../api/fuzzy_inference/evaluateFuzzySystem';
import {
    DefuzzificationMethod,
    DEFUZZIFICATION_METHODS,
    EvaluateFuzzySystemResponse,
    FuzzyInputDto,
} from '../../types/fuzzy_inference';
import { InputParameterResponse } from '../../types/input_parameter';

interface FuzzyEvaluationProps {
    problemId: number;
    inputParameters: InputParameterResponse[];
}

const FuzzyEvaluation: React.FC<FuzzyEvaluationProps> = ({
    problemId,
    inputParameters,
}) => {
    // State for input values
    const [inputValues, setInputValues] = useState<Record<number, number>>({});
    const [method, setMethod] = useState<DefuzzificationMethod>('centroid');
    const [result, setResult] = useState<EvaluateFuzzySystemResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Initialize input values with midpoints
    useEffect(() => {
        const initialValues: Record<number, number> = {};
        inputParameters.forEach((param) => {
            initialValues[param.id] = (param.start + param.end) / 2;
        });
        setInputValues(initialValues);
    }, [inputParameters]);

    const handleInputChange = (paramId: number, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setInputValues((prev) => ({ ...prev, [paramId]: numValue }));
        }
    };

    const handleEvaluate = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const inputs: FuzzyInputDto[] = Object.entries(inputValues).map(
                ([paramId, value]) => ({
                    input_parameter_id: parseInt(paramId),
                    crisp_value: value,
                })
            );

            const response = await evaluateFuzzySystem({
                problem_id: problemId,
                inputs,
                method,
                resolution: 100,
            });

            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    if (inputParameters.length === 0) {
        return (
            <div className={classes.NoProblem}>
                Добавьте входные параметры для выполнения нечёткого вывода
            </div>
        );
    }

    return (
        <div className={classes.FuzzyEvaluationPage}>
            {/* Input Section */}
            <div className={classes.Section}>
                <h2 className={classes.SectionTitle}>Входные значения</h2>
                <div className={classes.InputGrid}>
                    {inputParameters.map((param) => (
                        <div key={param.id} className={classes.InputCard}>
                            <label className={classes.InputLabel}>{param.name}</label>
                            <span className={classes.InputRange}>
                                Диапазон: [{param.start.toFixed(2)}, {param.end.toFixed(2)}]
                            </span>
                            <div className={classes.InputField}>
                                <input
                                    type="number"
                                    className={classes.NumberInput}
                                    value={inputValues[param.id] ?? ''}
                                    onChange={(e) => handleInputChange(param.id, e.target.value)}
                                    min={param.start}
                                    max={param.end}
                                    step={(param.end - param.start) / 100}
                                />
                            </div>
                            {param.input_values.length > 0 && (
                                <div className={classes.MembershipList}>
                                    {param.input_values.map((iv) => (
                                        <span key={iv.id} className={classes.MembershipItem}>
                                            <span className={classes.MembershipTerm}>{iv.value}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Method Selection */}
            <div className={classes.Section}>
                <div className={classes.MethodSelector}>
                    <label className={classes.MethodLabel}>Метод дефаззификации</label>
                    <select
                        className={classes.MethodSelect}
                        value={method}
                        onChange={(e) => setMethod(e.target.value as DefuzzificationMethod)}
                    >
                        {DEFUZZIFICATION_METHODS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Evaluate Button */}
            <button
                className={classes.EvaluateButton}
                onClick={handleEvaluate}
                disabled={loading || inputParameters.length === 0}
            >
                {loading ? 'Вычисление...' : 'Выполнить нечёткий вывод'}
            </button>

            {/* Error Message */}
            {error && <div className={classes.ErrorMessage}>{error}</div>}

            {/* Results Section */}
            {result && (
                <div className={classes.Section}>
                    <h2 className={classes.SectionTitle}>Результаты вывода</h2>
                    <div className={classes.ResultsSection}>
                        {result.outputs.map((output) => (
                            <div key={output.output_parameter_id} className={classes.OutputCard}>
                                <div className={classes.OutputHeader}>
                                    <span className={classes.OutputName}>
                                        {output.output_parameter_name}
                                    </span>
                                    <span className={classes.OutputValue}>
                                        {output.crisp_value.toFixed(4)}
                                    </span>
                                </div>
                                <div className={classes.OutputDetails}>
                                    <div className={classes.DetailRow}>
                                        <span>Активированных правил:</span>
                                        <span>{output.fired_rules_count}</span>
                                    </div>
                                </div>

                                {/* Fuzzified Inputs Details */}
                                <div className={classes.FuzzifiedInputs}>
                                    <h4>Фаззификация входов:</h4>
                                    {output.fuzzified_inputs.map((fi) => (
                                        <div
                                            key={fi.input_parameter_id}
                                            className={classes.FuzzifiedInput}
                                        >
                                            <div className={classes.FuzzifiedInputName}>
                                                {fi.input_parameter_name} = {fi.crisp_value.toFixed(4)}
                                            </div>
                                            <div className={classes.MembershipList}>
                                                {fi.membership_degrees
                                                    .filter((md) => md.degree > 0)
                                                    .map((md) => (
                                                        <span
                                                            key={md.linguistic_term}
                                                            className={classes.MembershipItem}
                                                        >
                                                            <span className={classes.MembershipTerm}>
                                                                {md.linguistic_term}:
                                                            </span>
                                                            <span className={classes.MembershipDegree}>
                                                                {md.degree.toFixed(3)}
                                                            </span>
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuzzyEvaluation;
