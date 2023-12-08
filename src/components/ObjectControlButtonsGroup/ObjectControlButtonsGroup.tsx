import React from 'react';
import {
  Button,
  ButtonGroup,
} from "react-bootstrap";
import {State} from "../../data_type/interfaces";
import { CanvasOrderDirection } from '../../data_type/constants';

interface Props {
  // You can define props here if needed
  editor: State;
  setEditor: (editorState: Record<string, any>, callback?: () => void) => void;
}

const ObjectControlButtonsGroup: React.FC<Props> = ({editor, setEditor}) => {
    // State example using the useState hook
    // const handleOnChange = () => {}
    
    // };

  return (
    <>           
      <Button
        variant="danger"
        disabled={editor.selectedObjects.length === 0}
        onClick={() => {
          editor.canvasController.deleteObjects(editor.selectedObjects!);
          setEditor({ selectedObjects: [] as fabric.Object[], textInput: "", editing: false });
        }}
      >
        <i className="fas fa-trash msr-1"></i>
        Delete Selected
      </Button>
      <ButtonGroup aria-label="change object order" className="ml-2">
        {Object.keys(CanvasOrderDirection).map((direction) => (
          <Button
            key={direction}
            variant="warning"
            disabled={editor.selectedObjects.length === 0}
            onClick={() =>
              editor.canvasController.changeObjectOrder(
                editor.selectedObjects,
                direction
              )
            }
          >
            {direction}
          </Button>
        ))}
      </ButtonGroup>
    </>
  );
};

export default ObjectControlButtonsGroup;
