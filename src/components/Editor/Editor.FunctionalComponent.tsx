import React, { useEffect, useCallback } from "react";
import {
  Col,
  Row,
  Button,
  ButtonGroup,
  Form
} from "react-bootstrap";

import Canvas, { CanvasController, CanvasOrderDirection } from "../Canvas/Canvas";
import "./Editor.css";

import { fabric } from "fabric";
import ColorSelector from "../ColorSelector/SketchPicker";
import TextEditingTool from "../TextEditingTool/TextEditingTool";
import SideMenu from "../SideMenu/SideMenu";
import TextLoader from "../TextLoader/TextLoader";
import TextureButtonsGroup from "../TextureButtonsGroup/TextureButtonsGroup";
import TShirtSelectionGroup from "../TShirtSelectionGroup/TShirtSelectionGroup";

import {
  DEFAULT_FONT,
  DEFAULT_TSHIRT_ID,
  DEFAULT_FILL_COLOR
} from "../../config/constants";

import State from "../../interfaces/State";

interface Props {
  editor: State;
  setEditor: (editorState: Record<string, any>, callback?: () => void) => void;
}

const hexToRGBA = (hex: string, alpha: number): string => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
};

const Editor: React.FC<Props> = ({ editor, setEditor }) => {

  const syncText = (textbox: any) => {
    textbox.on("change", function () {
      setEditor({ textInput: textbox.text });
    });
  };

  const handleClickOutsideCanvas = useCallback(
    (event: MouseEvent) => {
      const canvas = editor.canvasController!.canvas;
      const canvasRect = canvas.getElement().getBoundingClientRect();
      const isClickOutsideCanvas =
        event.clientX < canvasRect.left ||
        event.clientX > canvasRect.right ||
        event.clientY < canvasRect.top ||
        event.clientY > canvasRect.bottom;

      if (isClickOutsideCanvas) {
        setEditor({ isCanvasDeselected: true }, () => {
          console.log(
            "Clicked outside canvas, isCanvasDeselected: ",
            editor.isCanvasDeselected
          );
          console.log("fillSelected: ", editor.fillSelected);
        });
      }
    },
    [editor, setEditor]
  );


  const preview = () => {
    setEditor({ previewing: !editor.previewing });
    if (editor.previewing) {
      editor.canvasController.maskEditableArea(
        editor.tshirtId!,
        editor.selectedObjects!
      );
      editor.canvasController.removeObjectsOutsideBoundary();
    } else {
      editor.canvasController.unclipObjects();
      editor.canvasController.ungroupObjects();
    }
    editor.canvasController.toggleEditableArea(editor.previewing!);
    setEditor({ isEditableAreaInvisible: editor.previewing });
    editor.canvasController.canvas.renderAll();
  };

  const handleColorSelection = (color: any) => {
    setEditor(
      {
        foreground: color.hex,
        currentColor: hexToRGBA(color.hex, 255),
      },
      () => {
        console.log ('editor.foreground: ', editor.foreground);
         console.log ('editor.foreground again: ', editor.foreground);
        const inputElements = document.querySelectorAll("input");
        const allNotActive = Array.from(inputElements).every(
          (element) => !element.disabled
        );

        if (
          editor.selectedObjects.length === 0 &&
          allNotActive
        ) {
          editor.canvasController.updateTShirtColor(
            editor.foreground,
            editor.tshirtId
          );
          setEditor({ tshirtColor: editor.foreground });
        } else if (editor.editing) {
          editor.canvasController.updateTextColor(
            editor.selectedObjects[0] as fabric.Textbox,
            editor.foreground
          );
        }
      }
    );
  };

  const loadFont = () => {
    const textLoaderClass: string = "spinner-border text-primary spinner-";
    const textLoader: Element = document.getElementsByClassName(
      `${textLoaderClass}off`
    )[0];
    console.log("textLoader: ", textLoader);
    if (textLoader) {
      textLoader.className = `${textLoaderClass}on`;
      const parentNode: Element = document.getElementsByClassName("canvas-container")[0];
      const spinnerContainer: Element = document.getElementsByClassName("spinner-container")[0];
      parentNode.appendChild(spinnerContainer);
    }
    setTimeout(() => {
      editor.canvasController!.forceRender(editor.selectedObjects![0]);
      const textLoader: Element = document.getElementsByClassName(
        `${textLoaderClass}on`
      )[0];
      if (textLoader) textLoader.className = `${textLoaderClass}off`;
    }, 2000);
  };

  const initCanvasController = (controller: CanvasController) => {
    controller.canvas.on("mouse:down", () => {
      const selected = controller.canvas.getActiveObjects();
      const textbox = selected[0];
      const canEdit = selected.length === 1 && textbox.isType("textbox");
      if (selected.length > 0) {
        setEditor(
          {
            selectedObjects: selected,
            editing: canEdit,
            textInput: canEdit ? (textbox as any).text : "",
            textFont: canEdit ? (textbox as any).fontFamily : DEFAULT_FONT,
            currentColor: canEdit ? (textbox as any).fill : DEFAULT_FILL_COLOR,
          },
          () => {
            if (canEdit) syncText(textbox);
          }
        );
      } else {
        setEditor({
          selectedObjects: [],
          editing: false,
          textInput: "",
          textFont: DEFAULT_FONT,
          currentColor: DEFAULT_FILL_COLOR,
        });
      }
      setEditor({ isCanvasDeselected: false });
    });

    controller.canvas.on("mouse:up", () => {
      const selected = controller.canvas.getActiveObjects();
      if (selected.length > 0)
        setEditor({
          selectedObjects: selected,
        });
    });
    controller.canvas.on("selection:created", function () {
      setEditor({ isCanvasDeselected: false }, () => {
        console.log(
          "selection:created, isCanvasDeselected: ",
          editor.isCanvasDeselected
        );
        console.log("fillSelected: ", editor.fillSelected);
      });
    });

    setEditor({ canvasController: controller, editorReady: true });
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutsideCanvas);

    return () => {
      document.removeEventListener("click", handleClickOutsideCanvas);
    };
  }, [handleClickOutsideCanvas]);

  return (
    <>
      <div>
        <Row className="main-body">
          <Col xs={1} className="side-menu-container">
            <SideMenu canvas={editor.canvasController!.canvas} editor={editor} setEditor={setEditor} />
          </Col>
          <Col xs={4} className="properties-menu-container d-flex flex-column">
            {editor.editorReady ? (
              <>
                <Row>
                  <TShirtSelectionGroup editor={editor} setEditor={setEditor} />
                </Row>
                <Row>
                  {editor.fillSelected &&
                    editor.selectedObjects!.length === 0 &&
                    !editor.isCanvasDeselected && (
                      <TextureButtonsGroup editor={editor} />
                    )}
                </Row>
                <Row className="d-flex">
                  {editor.fillSelected &&
                    !editor.isCanvasDeselected && (
                      <ColorSelector
                        color={editor.foreground}
                        handleChangeComplete={(color: string) => {
                          handleColorSelection(color);
                        }}
                      />
                    )}
                </Row>
                <Row className="align-self-end">
                  <Button variant="light" onClick={preview}>
                    Preview
                  </Button>
                  <Form>
                    <Form.Check
                      type="checkbox"
                      id="myCheckbox"
                      label="Hide Editable Area"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = e.currentTarget.checked;
                        editor.canvasController!.toggleEditableArea(checked);
                        setEditor({ isEditableAreaInvisible: checked });
                      }}
                    />
                  </Form>
                </Row>
              </>
            ) : null}
          </Col>
          <Col xs={6} className="editor-container">
            <Canvas
              tShirtId={DEFAULT_TSHIRT_ID}
              tshirt="tshirt"
              controller={(controller) => initCanvasController(controller)}
            />
            <TextLoader className="spinner-off" />
            <div className="mt-3">
              <Button
                variant="danger"
                disabled={editor.selectedObjects!.length === 0}
                onClick={() => {
                  editor.canvasController!.deleteObjects(editor.selectedObjects!);
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
                    disabled={editor.selectedObjects!.length === 0}
                    onClick={() =>
                      editor.canvasController!.changeObjectOrder(
                        editor.selectedObjects!,
                        direction
                      )
                    }
                  >
                    {direction}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
            <div className="mt-3">
              {!editor.editing || (<TextEditingTool
                setEditor={setEditor}
                editor={editor}
                loadFont={loadFont}
              />)}
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Editor;