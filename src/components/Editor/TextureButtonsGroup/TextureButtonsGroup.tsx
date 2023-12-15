import React from 'react'
import Thumbnail from '../Thumbnail/Thumbnail';
import {State} from "../../../data_type/interfaces";
interface Props {
    editor:State;
    setEditor: (editorState: Record<string, any>, callback?: () => void) => void;
}

const TextureButtonsGroup:React.FC<Props> = ({editor, setEditor}) => {
    const selectionEventHandler = (e: any) => {
            // map texture
            editor.canvasController.updateTexture(
                e.target.getAttribute("src")
            );
            setEditor({isCanvasDeselected:false});
        }

  return (
    <>
        <Thumbnail
            imageUrl="images/textures/01.jpg"
            handleSelection={selectionEventHandler}
        />
        <Thumbnail
            imageUrl="images/textures/02.jpg"
            handleSelection={selectionEventHandler}
        />
        <Thumbnail
            imageUrl="images/textures/03.jpg"
            handleSelection={selectionEventHandler}
        />
        <Thumbnail
            imageUrl="images/textures/04.jpg"
            handleSelection={selectionEventHandler}
        />
        <Thumbnail
            imageUrl="images/textures/05.jpg"
            handleSelection={selectionEventHandler}
        />
    </>
  );
}

export default TextureButtonsGroup;

