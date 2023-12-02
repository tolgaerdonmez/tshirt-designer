import React, { ChangeEvent } from 'react';
import {
  Button,
  InputGroup,
  Form,
  FormControl
} from "react-bootstrap";
import { CanvasController } from "../Canvas/Canvas";
import FontPicker from "../CustomFontPicker";
import { google_access_key } from "../../config.json";

import "./TextEditingTool.css";

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
  // You can define props here if needed
  editorState:State;
  setEditorState:(properties:object, callback?:()=>void)=>void;
  loadFont:()=>void;
}

const TextEditingTool: React.FC<Props> = ({editorState, setEditorState, loadFont}) => {
  // State example using the useState hook

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditorState({[e.target.name]: e.target.value });
        if (editorState.editing) {
        editorState.canvasController.updateText(
            editorState.selectedObjects[0] as fabric.Textbox,
            editorState.textInput,
            editorState.textFont,
        );
        }
    };


  return (
    <>
     <InputGroup className="my-3">
        <InputGroup.Prepend>
            <FontPicker
            apiKey={google_access_key}
            activeFontFamily={editorState.textFont}
            onChange={(nextFont) => {
                setEditorState({
                textFont: nextFont.family,
                }, ()=>{
                    if (editorState.editing) {
                        editorState.canvasController.updateText(
                            editorState.selectedObjects[0] as fabric.Textbox,
                            editorState.textInput,
                            editorState.textFont
                        );
                        loadFont();
                    }
                });
            }}
            
            setActiveFontCallback={() => {
                console.log ("setActiveFontCallback");
            }}
            />
        </InputGroup.Prepend>
        <Form.Group className="mb-1">
            <FormControl
                placeholder={
                !editorState.editing ? "Add Text" : "Update Text"
                }
                aria-label="text"
                name="textInput"
                onChange={handleOnChange}
                value={editorState.textInput}
                type="text"
                className="textInput"
            />
        </Form.Group>
        <InputGroup.Prepend>
            <Button
            className="h-"
            onClick={() => {
                const fillColor =
                editorState.foreground !== editorState.tshirtColor
                    ? editorState.foreground
                    : "#000000";
                if (!editorState.editing)
                editorState.canvasController.addText(
                    editorState.textInput,
                    editorState.textFont,
                    fillColor                            );
                else
                editorState.canvasController.updateText(
                    editorState.selectedObjects[0] as fabric.Textbox,
                    editorState.textInput,
                    editorState.textFont
                    //fillColor
                );
                setEditorState({ textInput: "", editing: false });
            }}
            >
            {!editorState.editing ? (
                <>
                <i className="fas fa-plus mr-1"></i>Add Text
                </>
            ) : (
                "Update Text"
            )}
            </Button>
        </InputGroup.Prepend>
        </InputGroup>
    </>
  );
};

export default TextEditingTool;