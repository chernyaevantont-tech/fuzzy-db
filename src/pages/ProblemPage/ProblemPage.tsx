import pageClasses from '../Page.module.css'
import classes from './ProblemPage.module.css'
import RightMenu from '../../modules/RightMenu/RightMenu';
import { BsBoxArrowInRight, BsBoxArrowLeft, BsJournalText, BsTable } from 'react-icons/bs';
import ProblemNavigation from '../../modules/ProblemNavigation/ProblemNavigation';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import InputParameterList from '../../modules/InputParameterList/InputParameterList';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { useEffect, useState } from 'react';
import { InputParameterResponse } from '../../types/input_parameter';
import { OutputParameterResponse } from '../../types/output_parameter';
import { createInputParameter } from '../../api/input_parameter/createInputParameter';
import { useProblemPathContext } from '../../storage/ProblemPath';
import { getFullProblemById } from '../../api/problem/getFullProblemById';
import { ProblemFullResponse } from '../../types/problem';

const ProblemPage = () => {
    const [inputParameters, setInputParameters] = useState<InputParameterResponse[]>([]);
    const [outputParameters, setOutputParameters] = useState<OutputParameterResponse[]>([]);

    const location = useLocation();

    const { prevProblem } = useProblemPathContext();

    useEffect(() => {
        getFullProblemById(prevProblem?.id ?? 0, (resp: ProblemFullResponse) => {
            setInputParameters(resp.input_parameters);
            setOutputParameters(resp.output_parameters);
        })
    }, []);

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
                    <Routes>
                        <Route path='/' element={<Navigate to="table" />} />
                        <Route path="table" element={<div>Таблица</div>} />
                        <Route path="user-output" element={<div>Пользовательский вывод</div>} />
                        <Route path='input-parameters' element={<InputParameterList inputParameters={inputParameters} setInputParameters={setInputParameters} />} />
                        <Route path='output-parameters' element={<div>Выходные параметры</div>} />
                    </Routes>
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
                    {
                        renderMenu()
                    }
                </RightMenu>
            </div>
        </main>
    );
};

export default ProblemPage;