import { useEffect, useState } from 'react';
import UintArrayImage from '../../ui/images/UintArrayImage/UintArrayImage';
import classes from './ProblemCard.module.css';
import DropdownMenu from '../../ui/separators/DropdownMenu/DropdownMenu';
import { FiMoreVertical } from 'react-icons/fi';
import { getImageById } from '../../api/image/getImageById';
import { removeProblemById } from '../../api/problem/removeProblemById';

interface ProblemCardProps {
    id: number;
    name: string;
    description: string;
    isFinal: boolean;
    imageId: number | null;
    addProblemIdToPathCallback: (id: number, name: string, isFinal: boolean) => void;
    removeProblemByIdCallback: (id: number) => void;
    editCallback: () => void;
    className?: string;
}

const ProblemCard: React.FC<ProblemCardProps> = ({
    id,
    name,
    description,
    isFinal,
    imageId,
    removeProblemByIdCallback,
    addProblemIdToPathCallback,
    editCallback,
    className
}) => {
    const [image, setImage] = useState<{ imageData: Uint8Array, imageFormat: string }>({ imageData: new Uint8Array, imageFormat: "" })
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (imageId != null) {
            getImageById(imageId, resp => setImage({ imageData: Uint8Array.from(resp.image_data), imageFormat: resp.image_format }))
        } else {
            setImage({ imageData: new Uint8Array, imageFormat: "" });
        }
    }, [imageId])

    return <div className={`${classes.Card} ${className || ""}`}>
        <UintArrayImage uintArrayImage={image.imageData} imageFormat={image.imageFormat} className={classes.Image} />
        <div className={classes.Content}>
            <div className={classes.CardTop}>
                <div className={classes.Tag}>
                    {
                        isFinal ?
                        "Задача" :
                        "Группа задач"
                    }    
                </div>
                <h4 className={classes.Name} onClick={() => addProblemIdToPathCallback(id, name, isFinal)}>
                    {name}
                </h4>
                <DropdownMenu
                    isOpen={menuIsOpen}
                    setIsOpen={setMenuIsOpen}
                    buttonClassName={classes.MoreMenuButton}
                    className={classes.MoreMenuWrapper}
                    buttonContent={
                        <FiMoreVertical className={classes.MoreOptionsButton} />
                    }
                >
                    <div className={classes.MoreMenu}>
                        <button onClick={editCallback}>Изменить</button>
                        <button onClick={() => removeProblemById(id, () => removeProblemByIdCallback(id))}>Удалить</button>
                    </div>
                </DropdownMenu>
            </div>
            <div className={classes.Description}>
                {description}
            </div>
        </div>
    </div>
}

export default ProblemCard;