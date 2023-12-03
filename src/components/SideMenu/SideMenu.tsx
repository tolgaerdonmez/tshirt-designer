import React from 'react';
import { CanvasController} from "../Canvas/Canvas";
import "./SideMenu.css";
import ClickableIcon from './ClickableIcon';
import { faShirt, faFont, faFill } from '@fortawesome/free-solid-svg-icons';
import ImageUploadModal from './Modals/ImageUploadModal';
import {Color, DEFAULT_TEXT_INPUT} from '../../config/constants';

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
    canvas:fabric.Canvas;
    editor:State;
    setEditor:(properties:object, callback?:()=>void)=>void;
}

const SideMenu: React.FC<Props> = ({canvas, editor, setEditor}) => {
  
  const handleTextClick = () =>{     
    const fillColor =
      (editor.foreground !== editor.tshirtColor)
          ? editor.foreground
          : Color.black;
      if (!editor.editing) { 
        editor.canvasController.addText(
          DEFAULT_TEXT_INPUT,
          editor.textFont,
          fillColor,
          true 
        );
      }
      setEditor({ textInput: DEFAULT_TEXT_INPUT, editing: true });
  };
  return (
    <>
        <div className="side-toolbar">
            <ClickableIcon fontAwesomeIcon={faShirt} text="T-Shirt" />
            <ImageUploadModal canvas={canvas} />
            <ClickableIcon fontAwesomeIcon={faFont} text="Text" onClick={handleTextClick} />
            <ClickableIcon fontAwesomeIcon={faFill} text="Color" />
          
        </div>
    </>
  );
};

export default SideMenu;
