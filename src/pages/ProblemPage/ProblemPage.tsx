import pageClasses from '../Page.module.css'
import classes from './ProblemPage.module.css'
import RightMenu from '../../modules/RightMenu/RightMenu';
import { BsBoxArrowInRight, BsBoxArrowLeft, BsCalculator, BsJournalText, BsTable } from 'react-icons/bs';
import ProblemNavigation from '../../modules/ProblemNavigation/ProblemNavigation';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import InputParameterList from '../../modules/InputParameterList/InputParameterList';
import OutputParameterList from '../../modules/OutputParameterList/OutputParameterList';
import RulesTable from '../../modules/RulesTable/RulesTable';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { useCallback, useEffect, useState } from 'react';
import { InputParameterResponse } from '../../types/input_parameter';
import { OutputParameterResponse } from '../../types/output_parameter';
import { createInputParameter } from '../../api/input_parameter/createInputParameter';
import { createOutputParameter } from '../../api/output_parameter/createOutputParameter';
import { useProblemPathContext } from '../../storage/ProblemPath';
import { getFullProblemById } from '../../api/problem/getFullProblemById';
import { ProblemFullResponse } from '../../types/problem';
import FuzzyEvaluation from '../../modules/FuzzyEvaluation/FuzzyEvaluation';

const ProblemPage = () => {
    const [inputParameters, setInputParameters] = useState<InputParameterResponse[]>([]);
    const [outputParameters, setOutputParameters] = useState<OutputParameterResponse[]>([]);
    const [dataVersion, setDataVersion] = useState(0);
    
    // Состояние открытости карточек параметров (по ID параметра)
    const [openInputCards, setOpenInputCards] = useState<Record<number, boolean>>({});
    const [openOutputCards, setOpenOutputCards] = useState<Record<number, boolean>>({});

    const location = useLocation();

    const { prevProblem } = useProblemPathContext();

    const fetchData = useCallback(() => {
        getFullProblemById(prevProblem?.id ?? 0, (resp: ProblemFullResponse) => {
            setInputParameters(resp.input_parameters);
            setOutputParameters(resp.output_parameters);
            setDataVersion(v => v + 1);
        });
    }, [prevProblem?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderMenu = () => {
        switch (location.pathname) {
            case "/problem/input-parameters":
                return (
                    <>
                        <RightMenu.Separator />
                        <RightMenu.Unit tip='Добавить параметр'>
                            <IoMdAddCircleOutline onClick={
                                () => createInputParameter(
                                    { problem_id: prevProblem?.id ?? 0 },
                                    (id: number) => {
                                        setInputParameters(prev =>
                                            [...prev, {
                                                id: id,
                                                name: "Новый параметр",
                                                problem_id: prevProblem!.id,
                                                input_values: [],
                                                start: 0,
                                                end: 1
                                            }])
                                    })
                            } />
                        </RightMenu.Unit>
                    </>
                )
            case "/problem/output-parameters":
                return (
                    <>
                        <RightMenu.Separator />
                        <RightMenu.Unit tip='Добавить параметр'>
                            <IoMdAddCircleOutline onClick={
                                () => createOutputParameter(
                                    { problem_id: prevProblem?.id ?? 0 },
                                    (id: number) => {
                                        setOutputParameters(prev =>
                                            [...prev, {
                                                id: id,
                                                name: "Новый параметр",
                                                problem_id: prevProblem!.id,
                                                fuzzy_output_values: [],
                                                start: 0,
                                                end: 1
                                            }])
                                    })
                            } />
                        </RightMenu.Unit>
                    </>
                )
            default:
                return <></>
        }
    }

    return (
        <main>
            <div className={`${pageClasses.Page} ${classes.Page}`}>
                <div className={classes.Content}>
                    <div className={classes.ToolsWrapper}>
                        <ProblemNavigation />
                    </div>
                    <div className={classes.RoutesWrapper}>
                        <Routes>
                            <Route path='/' element={<Navigate to="table" />} />
                            <Route path="table" element={
                                <RulesTable 
                                    problemId={prevProblem?.id ?? 0}
                                    inputParameters={inputParameters}
                                    outputParameters={outputParameters}
                                />
                            } />
                            <Route path="user-output" element={<div>Пользовательский вывод</div>} />
                        <Route path='input-parameters' element={
                            <InputParameterList 
                                key={`input-${dataVersion}`}
                                inputParameters={inputParameters} 
                                setInputParameters={setInputParameters}
                                refetchData={fetchData}
                                openCards={openInputCards}
                                setOpenCards={setOpenInputCards}
                            />
                        } />
                        <Route path='output-parameters' element={
                            <OutputParameterList 
                                key={`output-${dataVersion}`}
                                outputParameters={outputParameters} 
                                setOutputParameters={setOutputParameters}
                                refetchData={fetchData}
                                openCards={openOutputCards}
                                setOpenCards={setOpenOutputCards}
                            />
                        } />
                        <Route path='evaluation' element={
                            <FuzzyEvaluation 
                                problemId={prevProblem?.id ?? 0}
                                inputParameters={inputParameters}
                            />
                        } />
                    </Routes>
                    </div>
                </div>
                <RightMenu>
                    <RightMenu.Unit tip={"Таблица выходных значений"}>
                        <NavLink className={({ isActive }) => `${isActive ? classes.SelectedIcon : ""}`} to="/problem/table">
                            <BsTable />
                        </NavLink>
                    </RightMenu.Unit>
                    <RightMenu.Unit tip={"Пользовательский вид"}>
                        <NavLink className={({ isActive }) => `${isActive ? classes.SelectedIcon : ""}`} to="/problem/user-output">
                            <BsJournalText />
                        </NavLink>
                    </RightMenu.Unit>
                    <RightMenu.Unit tip={"Входные параметры"}>
                        <NavLink className={({ isActive }) => `${isActive ? classes.SelectedIcon : ""}`} to="/problem/input-parameters">
                            <BsBoxArrowInRight />
                        </NavLink>
                    </RightMenu.Unit>
                    <RightMenu.Unit tip={"Выходные параметры"}>
                        <NavLink className={({ isActive }) => `${isActive ? classes.SelectedIcon : ""}`} to="/problem/output-parameters">
                            <BsBoxArrowLeft />
                        </NavLink>
                    </RightMenu.Unit>
                    <RightMenu.Unit tip={"Нечёткий вывод"}>
                        <NavLink className={({ isActive }) => `${isActive ? classes.SelectedIcon : ""}`} to="/problem/evaluation">
                            <BsCalculator />
                        </NavLink>
                    </RightMenu.Unit>
                    {
                        renderMenu()
                    }
                </RightMenu>
            </div>
        </main>
    );
};

export default ProblemPage;