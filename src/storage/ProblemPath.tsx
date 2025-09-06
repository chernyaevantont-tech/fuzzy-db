import { createContext, useContext, useState } from "react";

export type ProblemPathRecord = {
    id: number;
    name: string;
    isFinal: boolean;
}

interface ProblemPathContextType {
    problemPath: ProblemPathRecord[];
    prevProblem: ProblemPathRecord | null;
    addProblem: (problem: ProblemPathRecord) => void;
    popProblem: () => void;
    goToProblemByIndex: (index: number) => boolean;
    cleanProblemPath: () => boolean;
}

const ProblemPathContext = createContext<ProblemPathContextType>({
    problemPath: [],
    prevProblem: null,
    addProblem: () => { },
    popProblem: () => { },
    goToProblemByIndex: () => false,
    cleanProblemPath: () => false,
});

export const useProblemPathContext = () => useContext(ProblemPathContext);

interface ProblemPathProviderProps {
    children: React.ReactNode;
}

export const ProblemPathProvider: React.FC<ProblemPathProviderProps> = ({ children }) => {
    const [problemPath, setProblemPath] = useState<ProblemPathRecord[]>([]);
    const [problemPathLength, setProblemPathLength] = useState<number>(0);
    const [prevProblem, setPrevProblem] = useState<ProblemPathRecord | null>(null);

    if (problemPath.length != problemPathLength) {
        setProblemPathLength(problemPath.length);
        setPrevProblem(problemPath.length > 0 ? problemPath[problemPath.length - 1] : null);
    }

    const addProblem = (problem: ProblemPathRecord) => {
        setProblemPath(prev => [...prev, problem]);
    }

    const popProblem = () => {
        const newProblemPath = [...problemPath];
        newProblemPath.pop();
        setProblemPath(newProblemPath);
    }

    const goToProblemByIndex = (index: number): boolean => {
        if (index == problemPath.length - 1) return false;
        const newProblemPath = [...problemPath];
        newProblemPath.splice(index + 1, newProblemPath.length - index - 1);
        setProblemPath(newProblemPath);
        return true;
    }

    const cleanProblemPath = (): boolean => {
        if (problemPath.length == 0) return false;
        setProblemPath([]);
        return true;
    }

    return (
        <ProblemPathContext.Provider value={{ problemPath, prevProblem, addProblem, popProblem, goToProblemByIndex, cleanProblemPath }}>
            {children}
        </ProblemPathContext.Provider>
    )
}