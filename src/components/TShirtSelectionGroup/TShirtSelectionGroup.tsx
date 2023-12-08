import React from 'react'
import Thumbnail from '../Thumbnail/Thumbnail';
import {State} from "../../data_type/interfaces";


interface Props {
    editor:State;
    setEditor:(properties:object, callback?:()=>void)=>void;
    
}

const TShirtSelectionGroup:React.FC<Props> = ({editor, setEditor}) => {
    const selectionEventHandler = (tshirtId:string) => {
            setEditor({ tshirtId }, () => {
                editor.canvasController!.setTShirt(editor.tshirtId!);
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

