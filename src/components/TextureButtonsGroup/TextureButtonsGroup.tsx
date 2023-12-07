import React from 'react'
import Thumbnail from '../Thumbnail/Thumbnail';
import State from "../../interfaces/State";
interface Props {
    editor:State;
}

const TextureButtonsGroup:React.FC<Props> = ({editor}) => {
    const selectionEventHandler = (e: any) => {
            // map texture
            editor.canvasController!.updateTexture(
                e.target.getAttribute("src"),
                editor.tshirtId!
            );
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

