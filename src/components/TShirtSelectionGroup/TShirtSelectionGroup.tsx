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
    setEditor:(properties:object, callback?:()=>void)=>void;
    
}

const TShirtSelectionGroup:React.FC<Props> = ({editor, setEditor}) => {
    const selectionEventHandler = (tshirtId:string) => {
            setEditor({ tshirtId }, () => {
                editor.canvasController.setTShirt(editor.tshirtId);
            });
        }

  return (
    <>
        <Thumbnail
            imageUrl="images/tshirt.svg"
            handleSelection={ ()=>{selectionEventHandler ("tshirt_0001");}}
        />  
        <Thumbnail
            imageUrl="images/tshirt2.svg"
            handleSelection={ ()=>{selectionEventHandler ("tshirt_0002");}}
        />      
    </>
  );
}

export default TShirtSelectionGroup;

