import React from 'react';
import "./SideMenu.css";
import ClickableIcon from './ClickableIcon';
import { faShirt, faFont } from '@fortawesome/free-solid-svg-icons';
import ImageUploadModal from './Modals/ImageUploadModal';
import {Color, DEFAULT_FG, DEFAULT_TEXT_INPUT} from '../../config/constants';
import State from '../../interfaces/State';

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
          DEFAULT_FG,
          true 
        );
      }
      setEditor({ textInput: DEFAULT_TEXT_INPUT, editing: true });
  };
  // const handleFillClick = () =>{     
  //     setEditor({ fillSelected: !editor.fillSelected });
  // };  
  return (
    <>
        <div className="side-toolbar">
            <ClickableIcon fontAwesomeIcon={faShirt} text="T-Shirt" />
            <ImageUploadModal canvas={canvas} />
            <ClickableIcon fontAwesomeIcon={faFont} text="Text" onClick={handleTextClick} />
            {/* <ClickableIcon fontAwesomeIcon={faFill} text="Color" onClick={handleFillClick} /> */}
          
        </div>
    </>
  );
};

export default SideMenu;
