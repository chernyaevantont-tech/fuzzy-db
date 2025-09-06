import TipContainer, { TipPosition } from '../../ui/separators/TipContainer/TipContainer';
import classes from './RightMenu.module.css';

interface RightMenuProps {
    children: React.ReactNode;
}

interface RightMenuComponent extends React.FC<RightMenuProps> {
    Unit: typeof Unit;
    Separator: typeof Separator;
}

const RightMenu: RightMenuComponent = ({ children }) => {
    return (
        <menu className={classes.Menu}>
            {children}
        </menu>
    )
}

interface UnitProps {
    children: React.ReactNode;
    tip: string;
}

const Unit: React.FC<UnitProps> = ({ children, tip }) => {
    return (
        <TipContainer tip={tip} tipPadding={30} tipPosition={TipPosition.Left}>
            <div className={classes.Unit}>
                {children}
            </div>
        </TipContainer>
    );
}

const Separator: React.FC = () => {
    return (
        <hr className={classes.Separator} />
    )
}

RightMenu.Unit = Unit;
RightMenu.Separator = Separator;

export default RightMenu;

