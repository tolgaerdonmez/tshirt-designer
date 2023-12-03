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
import {Color} from "../../config/constants";
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
  editor:State;
  setEditor:(properties:object, callback?:()=>void)=>void;
  loadFont:()=>void;
  visible?:boolean;
}

const TextEditingTool: React.FC<Props> = ({editor, setEditor, loadFont, visible=false}) => {
    // State example using the useState hook
    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditor({[e.target.name]: e.target.value });
        if (editor.editing) {
            editor.canvasController.updateText(
                editor.selectedObjects[0] as fabric.Textbox,
                editor.textInput,
                editor.textFont,
            );
        }
    };


  return (
    <>
     {visible && (<InputGroup className="my-3">
        <InputGroup.Prepend>
            <FontPicker
            apiKey={google_access_key}
            activeFontFamily={editor.textFont}
            onChange={(nextFont) => {
                setEditor({
                textFont: nextFont.family,
                }, ()=>{
                    if (editor.editing) {
                        editor.canvasController.updateText(
                            editor.selectedObjects[0] as fabric.Textbox,
                            editor.textInput,
                            editor.textFont
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
                    !editor.editing ? "Add Text" : "Update Text"
                }
                aria-label="text"
                name="textInput"
                onChange={handleOnChange}
                value={editor.textInput}
                type="text"
                className="textInput"
            />
        </Form.Group>
        <InputGroup.Prepend>
            <Button
            className="h-"
            onClick={() => {
                const fillColor =
                (editor.foreground !== editor.tshirtColor)
                    ? editor.foreground
                    : Color.black;
                if (!editor.editing)
                editor.canvasController.addText(
                    editor.textInput,
                    editor.textFont,
                    fillColor);
                else
                editor.canvasController.updateText(
                    editor.selectedObjects[0] as fabric.Textbox,
                    editor.textInput,
                    editor.textFont
                );
                setEditor({ textInput: "", editing: false });
            }}
            >
            {!editor.editing ? (
                <>
                <i className="fas fa-plus mr-1"></i>Add Text
                </>
            ) : (
                "Update Text"
            )}
            </Button>
        </InputGroup.Prepend>
        </InputGroup>)}
    </>
  );
};

export default TextEditingTool;