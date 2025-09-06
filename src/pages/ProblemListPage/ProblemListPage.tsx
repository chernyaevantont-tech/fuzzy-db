import { IoMdAddCircleOutline } from 'react-icons/io';
import RightMenu from '../../modules/RightMenu/RightMenu';
import pageClasses from '../Page.module.css';
import classes from './ProblemListPage.module.css';
import useModal from '../../components/Modal/hooks';
import ProblemCardList from '../../modules/ProblemCardList/ProblemCardList';
import ProblemNavigation from '../../modules/ProblemNavigation/ProblemNavigation';

const ProblemListPage: React.FC = () => {
    const [createModalIsShown, toggleCreateModalIsShown] = useModal();

    return (
        <main className={`${pageClasses.Page} ${classes.Page}`}>
            <div className={classes.Content}>
                <div className={classes.ToolsWrapper}>
                    <ProblemNavigation />
                </div>
                <ProblemCardList
                    createProblemModalIsShown={createModalIsShown}
                    toggleProblemModalCallback={toggleCreateModalIsShown}
                />
            </div>
            <RightMenu>
                <RightMenu.Unit tip="Добавить проблему">
                    <IoMdAddCircleOutline onClick={() => toggleCreateModalIsShown()} />
                </RightMenu.Unit>
            </RightMenu>
        </main>
    )
}

export default ProblemListPage;