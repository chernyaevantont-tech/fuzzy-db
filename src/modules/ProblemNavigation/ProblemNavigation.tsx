import React from 'react';
import classes from './ProblemNavigation.module.css';
import { FaAngleRight } from 'react-icons/fa';
import { IoIosList } from 'react-icons/io';
import { useProblemPathContext } from '../../storage/ProblemPath';
import { useNavigate } from 'react-router-dom';

interface ProblemNavigationProps {

}

const ProblemNavigation: React.FC<ProblemNavigationProps> = () => {
    const { problemPath, goToProblemByIndex, cleanProblemPath } = useProblemPathContext()

    const navigate = useNavigate();

    return (
        <div className={classes.Navigation}>
            <IoIosList
                className={`${classes.Icon} ${classes.NavigationIcon}`}
                onClick={() => {
                    cleanProblemPath();
                    navigate("/");
                }
                }
            />
            {
                problemPath.map((p, index) => <>
                    <FaAngleRight className={classes.AngleIcon} />
                    <div onClick={() => {
                        if (goToProblemByIndex(index)) {
                            navigate("/");
                        }
                    }}
                        className={classes.NavigationText}
                        key={p.id}
                    >
                        {p.name}
                    </div>
                </>)
            }
        </div>
    );
};

export default ProblemNavigation;