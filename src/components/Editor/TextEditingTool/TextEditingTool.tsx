import React, { ChangeEvent } from 'react';
import {
  Button,
  InputGroup,
  FormControl
} from "react-bootstrap";
import FontPicker from "../CustomFontPicker";
import { google_access_key } from "../../../config.json";
import {Color} from "../../../data_type/constants";
import "./TextEditingTool.css";
import {State} from "../../../data_type/interfaces";

interface Props {
  // You can define props here if needed
  editor: State;
  setEditor: (editorState: Record<string, any>, callback?: () => void) => void;
}

const TextEditingTool: React.FC<Props> = ({editor, setEditor}) => {
    // State example using the useState hook
    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditor({[e.target.name]: e.target.value });
        if (editor.editing) {
            editor.canvasController.updateText(
                editor.selectedObjects![0] as fabric.Textbox,
                editor.textInput,
                editor.textFont,
            );
        }
    };

  return (
    <>
     <InputGroup className="my-3">
        <InputGroup.Prepend>
            <FontPicker
            apiKey={google_access_key}
            activeFontFamily={editor.textFont}
            onChange={(nextFont) => {
                setEditor({textFont: nextFont.family});
            }}
            
            setActiveFontCallback={() => {
                console.log ("setActiveFontCallback");
            }}
            />
        </InputGroup.Prepend>
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
        <InputGroup.Append> 
            <Button
            className="h-"
            onClick={() => {
                const fillColor =
                (editor.foregroundColor !== editor.tshirtColor)
                    ? editor.foregroundColor
                    : Color.black;
                if (!editor.editing) {
                    editor.canvasController.addText(
                        editor.textInput,
                        editor.textFont,
                        fillColor);
                    const allObjects = editor.canvasController.canvas.getObjects();
                    if (allObjects.length > 0) {
                        const textObj:fabric.Object = allObjects[allObjects.length - 1];
                        editor.canvasController.canvas.setActiveObject(textObj);
                        setEditor({selectedObjects: textObj,editing: true});   
                    }
                }
                else {
                    editor.canvasController.updateText(
                        editor.selectedObjects[0] as fabric.Textbox,
                        editor.textInput,
                        editor.textFont
                    );
                    setEditor({ textInput: "", editing: false });
                }
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
        </InputGroup.Append>
        </InputGroup>
    </>
  );
};

export default TextEditingTool;