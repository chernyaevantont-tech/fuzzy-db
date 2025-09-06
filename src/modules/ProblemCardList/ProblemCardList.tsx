import React, { useEffect, useState } from 'react';
import CreateProblemModal from './CreateProblemModal/CreateProblemModal';
import classes from './ProblemCardList.module.css';
import { ProblemResponse } from '../../types/problem';
import ProblemCard from '../../components/ProblemCard/ProblemCard';
import { getAllProblemsByPrevProblemId } from '../../api/problem/getAllProblemsByPrevIProblemd';
import { useProblemPathContext } from '../../storage/ProblemPath';
import { useNavigate } from 'react-router-dom';

interface ProblemCardListProps {
    createProblemModalIsShown: boolean;
    toggleProblemModalCallback: () => void;
}

const ProblemCardList: React.FC<ProblemCardListProps> = ({
    createProblemModalIsShown,
    toggleProblemModalCallback,
}) => {
    const [problems, setProblems] = useState<Array<ProblemResponse>>([]);
    const { prevProblem, addProblem } = useProblemPathContext();

    const navigate = useNavigate();

    useEffect(() => {
        getAllProblemsByPrevProblemId(prevProblem?.id ?? null, setProblems);
    }, [prevProblem?.id ?? null])

    return (
        <>
            <div className={classes.ProblemCardList}>
                {problems.map(problem => <ProblemCard
                    id={problem.id}
                    name={problem.name}
                    description={problem.description}
                    imageId={problem.image_id}
                    isFinal={problem.is_final}
                    addProblemIdToPathCallback={(id: number, name: string, isFinal: boolean) => 
                    {
                        addProblem({ id, name, isFinal });
                        if (isFinal) navigate("problem");
                    }}
                    removeProblemByIdCallback={(id: number) => setProblems(prev => prev.filter(problem => problem.id != id))}
                    key={problem.id}
                />)}
            </div>
            <CreateProblemModal
                isShown={createProblemModalIsShown}
                prevProblemId={prevProblem?.id ?? null}
                createProblemCallback={(
                    id: number,
                    name: string,
                    description: string,
                    isFinal: boolean,
                    prevProblemId: number | null,
                    imageId: number | null
                ) => {
                    const currentDate = new Date();
                    setProblems(prev => [...prev, {
                        id: id,
                        name: name,
                        description: description,
                        is_final: isFinal,
                        prev_problem_id: prevProblemId,
                        image_id: imageId,
                        created_at: currentDate.toISOString(),
                        updated_at: ""
                    }])
                }}
                closeCallback={toggleProblemModalCallback}
            />
        </>
    );
};

export default ProblemCardList;