import React from 'react'
import Thumbnail from '../Thumbnail/Thumbnail';
import { CanvasController} from "../Canvas/Canvas";
interface State {
  canvasController: CanvasController;
  editorReady: boolean;
  textInput: string;
  textFont: string;
  editing: boolean;
  currentColor: string;
  selectedObjects: fabric.Object[];  // need this
  foreground: string;
  textureImgPath: string;
  tshirtId: string;
  tshirtColor: string;
  isEditableAreaInvisible: boolean;
  [key: string]: any;
}

interface Props {
    editor:State;
    
}

const TextureButtonsGroup:React.FC<Props> = ({editor}) => {
    const selectionEventHandler = (e: any) => {
            // map texture
            editor.canvasController.updateTexture(
                e.target.getAttribute("src"),
                editor.tshirtId
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

