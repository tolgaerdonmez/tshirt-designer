import React, { useState, useEffect } from "react";
import { fabric } from "fabric";
import Navbar from "./components/Navbar/Navbar";
import Editor from "./components/Editor/Editor";
import { State, CanvasController } from "./data_type/interfaces";
import "./App.css";

import {
  DEFAULT_FG,
  DEFAULT_FONT,
  DEFAULT_TSHIRT_COLOR,
  DEFAULT_TSHIRT_ID
} from "./data_type/constants";

const App: React.FC = () => {
  const [state, setState] = useState<State>({
    canvasController: {} as CanvasController,
    editorReady: false,
    textInput: "",
    textFont: DEFAULT_FONT,
    editing: false,
    selectedObjects: [] as fabric.Object[],
    foregroundColor: DEFAULT_FG,
    textureImgPath: "",
    tshirtId: DEFAULT_TSHIRT_ID,
    tshirtColor: DEFAULT_TSHIRT_COLOR,
    isEditableAreaInvisible: false,
    previewing: false,
    fillSelected: true,
    isCanvasDeselected: true,
	  callback:()=>{}
  });

  const handleEditorState = (
    editorState: Record<string, any>,
    callback: () => void = () => {}
  ) => {
    setState((prevState) => ({ ...prevState, ...editorState, callback }));
  };

  // dom textbox onchange event
  const loadFont = () => {
    const textLoaderClass:string = "spinner-border text-primary spinner-";
    const textLoader:Element = document.getElementsByClassName (`${textLoaderClass}off`)[0];
    console.log ('textLoader: ', textLoader);
    if (textLoader) {
        textLoader.className = `${textLoaderClass}on`;
        const parentNode:Element = document.getElementsByClassName ("canvas-container")[0];
        const spinnerContainer:Element = document.getElementsByClassName ("spinner-container")[0];
        parentNode.appendChild(spinnerContainer);
    }
    // This is ugly but I have to dig deeper into the dependencies to
    // find its async function.
    // Just a temp fix by timing it.
    setTimeout (()=>{
        state.canvasController.forceRender(state.selectedObjects[0]);
        const textLoader:Element = document.getElementsByClassName (`${textLoaderClass}on`)[0];
        if (textLoader)
            textLoader.className = `${textLoaderClass}off`;
    }, 2000);
  }

  useEffect(()=>{
	  state.callback();
  },[state]);

  useEffect(()=>{
    // callback from Filemenu 
    const { editorReady, 
            previewing, 
            canvasController, 
            tshirtId, 
            selectedObjects } = state;

    if(editorReady) 
    {      
      if (previewing) {
          canvasController.maskEditableArea(tshirtId, selectedObjects!);
          // Trying to figure out why it creats copies of objects 
          // and place the objects centered at (0,0)
          canvasController.removeObjectsOutsideBoundary();
          canvasController.lock();
      }
      else {
          canvasController.unclipObjects();
          canvasController.ungroupObjects();
          canvasController.unlock();
      }
      canvasController.togglePrintableArea(previewing)
      handleEditorState({isEditableAreaInvisible: previewing})
      canvasController.canvas.renderAll();
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  },[state.previewing]);

  useEffect(()=>{
    const {editorReady, canvasController, tshirtId} = state;
    console.log ('useEffect tshirtId: ', tshirtId);
    if(editorReady) 
      canvasController.setTShirt(tshirtId); 
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  },[state.tshirtId])

  useEffect(()=>{
    const {editing, 
            editorReady, 
            canvasController, 
            selectedObjects, 
            textInput, 
            textFont} = state;
    
    if (editing && editorReady && selectedObjects.length > 0) {
        //canvasController.canvas.setActiveObject(selectedObjects[0]);
        canvasController.updateText(
            selectedObjects[0] as fabric.Textbox,
            textInput,  
            textFont
        );
        loadFont();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.textFont]);

  // useEffect(()=>{
  //       // Get all elements in the HTML document
  //     const {editorReady, 
  //           selectedObjects, 
  //           canvasController, 
  //           foregroundColor, 
  //           tshirtId, 
  //           editing} = state;
  //     if (editorReady && foregroundColor) 
  //     {
  //       const inputElements = document.querySelectorAll("input");
  //       // Check if all elements are not selected
  //       const allNotActive = Array.from(inputElements).every(
  //         (element) => !element.disabled
  //       );
  //       // only tshirt is selected on the canvas
  //       if (selectedObjects.length === 0 && allNotActive) {
  //         canvasController.updateTShirtColor(
  //           foregroundColor,
  //           tshirtId,
  //         );
  //         handleEditorState({ tshirtColor: foregroundColor});
  //       } else if (editing) {  // text is selected
  //             canvasController.updateTextColor (
  //               selectedObjects[0] as fabric.Textbox,
  //               foregroundColor
  //             );
  //       }
  //       handleEditorState({isCanvasDeselected:false});
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [state.foregroundColor, state.foregroundColor]);

  return (
    <>
      <Navbar editor={state} setEditor={handleEditorState} />
      <Editor editor={state} setEditor={handleEditorState} />
    </>
  );
};

export default App;
