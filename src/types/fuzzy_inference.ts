// Types for fuzzy inference evaluation

export type FuzzyInputDto = {
    input_parameter_id: number;
    crisp_value: number;
};

export type EvaluateFuzzySystemRequest = {
    problem_id: number;
    inputs: FuzzyInputDto[];
    method: 'centroid' | 'bisector' | 'mom' | 'som' | 'lom';
    resolution?: number;
};

export type MembershipDegreeDto = {
    linguistic_term: string;
    degree: number;
};

export type FuzzifiedInputInfoDto = {
    input_parameter_id: number;
    input_parameter_name: string;
    crisp_value: number;
    membership_degrees: MembershipDegreeDto[];
};

export type FuzzyOutputResultDto = {
    output_parameter_id: number;
    output_parameter_name: string;
    crisp_value: number;
    fuzzified_inputs: FuzzifiedInputInfoDto[];
    fired_rules_count: number;
};

export type EvaluateFuzzySystemResponse = {
    problem_id: number;
    problem_name: string;
    outputs: FuzzyOutputResultDto[];
};

export type DefuzzificationMethod = 'centroid' | 'bisector' | 'mom' | 'som' | 'lom';

export const DEFUZZIFICATION_METHODS: { value: DefuzzificationMethod; label: string }[] = [
    { value: 'centroid', label: 'Центр тяжести (COG)' },
    { value: 'bisector', label: 'Бисектриса (BOA)' },
    { value: 'mom', label: 'Среднее максимумов (MOM)' },
    { value: 'som', label: 'Наименьший максимум (SOM)' },
    { value: 'lom', label: 'Наибольший максимум (LOM)' },
];
