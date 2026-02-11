import { IoMdAddCircleOutline, IoMdDownload } from 'react-icons/io';
import RightMenu from '../../modules/RightMenu/RightMenu';
import pageClasses from '../Page.module.css';
import classes from './ProblemListPage.module.css';
import useModal from '../../components/Modal/hooks';
import ProblemCardList from '../../modules/ProblemCardList/ProblemCardList';
import ProblemNavigation from '../../modules/ProblemNavigation/ProblemNavigation';
import { importProblemToParent } from '../../api/problem/exportImport';
import { useProblemPathContext } from '../../storage/ProblemPath';
import { useState } from 'react';

const ProblemListPage: React.FC = () => {
    const [createModalIsShown, toggleCreateModalIsShown] = useModal();
    const { prevProblem } = useProblemPathContext();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleImport = () => {
        importProblemToParent(prevProblem?.id ?? null, () => {
            setRefreshKey(prev => prev + 1);
        });
    }

    return (
        <main className={`${pageClasses.Page} ${classes.Page}`}>
            <div className={classes.Content}>
                <div className={classes.ToolsWrapper}>
                    <ProblemNavigation />
                </div>
                <ProblemCardList
                    key={refreshKey}
                    createProblemModalIsShown={createModalIsShown}
                    toggleProblemModalCallback={toggleCreateModalIsShown}
                />
            </div>
            <RightMenu>
                <RightMenu.Unit tip="Добавить проблему">
                    <IoMdAddCircleOutline onClick={() => toggleCreateModalIsShown()} />
                </RightMenu.Unit>
                <RightMenu.Unit tip="Импорт">
                    <IoMdDownload onClick={handleImport} />
                </RightMenu.Unit>
            </RightMenu>
        </main>
    )
}

export default ProblemListPage;