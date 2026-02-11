import { Window } from "@tauri-apps/api/window"
import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom";
import classes from './AppTitle.module.css';
import { BsDashLg, BsWindowFullscreen, BsWindowStack, BsXLg } from "react-icons/bs";
import { GrHelp } from "react-icons/gr";
import HelpPage from "../../pages/HelpPage/HelpPage";

const AppTitle: React.FC = () => {
    const [appWindow, _] = useState(Window.getCurrent());
    const [maximizedFlag, setMaximizedFlag] = useState<boolean>(false);
    const [showHelp, setShowHelp] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            appWindow.isMaximized().then(resp => setMaximizedFlag(resp));
        }
        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <>
            <header className={`${classes.AppTitle} ${maximizedFlag ? classes.AppTitleMaximized : ""}`}>
                <div className={classes.Left} data-tauri-drag-region>
                    <GrHelp className={classes.Icon} onClick={() => setShowHelp(!showHelp)} style={{cursor: 'pointer'}}/>
                </div>
                <div className={classes.Right} data-tauri-drag-region>
                    <BsDashLg onClick={() =>  appWindow.minimize()} className={classes.Icon}/>
                    {
                        maximizedFlag?
                        <BsWindowStack className={classes.Icon} onClick={() => appWindow.unmaximize()}/>
                        :
                        <BsWindowFullscreen className={classes.Icon} onClick={() => appWindow.maximize()}/>
                    }
                    <BsXLg className={`${classes.Icon} ${classes.Quit}`} onClick={() => appWindow.close()}/>
                </div>
            </header>
            {showHelp && <HelpPage onClose={() => setShowHelp(false)} />}
            <Outlet />
        </>
    )
}

export default AppTitle;