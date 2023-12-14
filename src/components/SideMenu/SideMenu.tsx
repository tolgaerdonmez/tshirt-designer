import React, {useState} from 'react';
import "./SideMenu.css";
import { OverlayTrigger, Popover } from 'react-bootstrap';
import ClickableIcon from './ClickableIcon';
import { faShirt, faFont, faUpload } from '@fortawesome/free-solid-svg-icons';
import ImageUploadModal from './Modals/ImageUploadModal';
import {Color, DEFAULT_TEXT_INPUT} from '../../data_type/constants';
import {State} from '../../data_type/interfaces';
import TShirtSelectionGroup from '../Editor/TShirtSelectionGroup/TShirtSelectionGroup';
interface Props {
    canvas:fabric.Canvas;
    editor:State;
    setEditor:(properties:object, callback?:()=>void)=>void;
}

const SideMenu: React.FC<Props> = ({canvas, editor, setEditor}) => {
  
  const [show, setShow] = useState(false);
  const placement = "right";

  const handleTextClick = () =>{     
    const fillColor =
      (editor.foregroundColor !== editor.tshirtColor)
          ? editor.foregroundColor
          : Color.black;
    
        editor.canvasController.addText(
          DEFAULT_TEXT_INPUT,
          editor.textFont,
          fillColor,
          true 
        );
        const allObjects = editor.canvasController.canvas.getObjects();
        if (allObjects.length > 0) {
            const textObj:fabric.Object = allObjects[allObjects.length - 1];
            editor.canvasController.canvas.setActiveObject(textObj);
            setEditor({textFont: editor.textFont,
                       textInput: DEFAULT_TEXT_INPUT, 
                       selectedObjects: [textObj], 
                       editing: true});
        }
      //}
      //setEditor({ textInput: DEFAULT_TEXT_INPUT, editing: true });
  };

  const handleShow = (visible:boolean) => { 
    setShow (visible);
  }

  // const handleFillClick = () =>{     
  //     setEditor({ fillSelected: !editor.fillSelected });
  // };  
  return (
    <>
        <div className="side-toolbar">         
            <OverlayTrigger
              trigger="click"
              key={placement}
              placement={placement}
              overlay={
                <Popover id={`popover-positioned-${placement}`}>
                  <Popover.Title as="h3">{`T-Shirt Style`}</Popover.Title>
                  <Popover.Content>
                    <TShirtSelectionGroup editor={editor} setEditor={setEditor} />
                  </Popover.Content>
                </Popover>
              }
            >
            <ClickableIcon fontAwesomeIcon={faShirt} text="T-Shirt" />
            </OverlayTrigger>
            <ClickableIcon fontAwesomeIcon={faUpload} text="Upload" onClick={()=>handleShow(true)} />
            <ClickableIcon fontAwesomeIcon={faFont} text="Text" onClick={handleTextClick} />
            {/* <ClickableIcon fontAwesomeIcon={faFill} text="Color" onClick={handleFillClick} /> */}
        </div>
        <ImageUploadModal show={show} setShow={handleShow} canvas={canvas} />
    </>
  );
};

export default SideMenu;
