import React, { Component, ChangeEvent } from "react";
import {
  Col,
  Row,
  Button,
  InputGroup,
  FormControl,
  ButtonGroup,
  Form
} from "react-bootstrap";

import Canvas, { CanvasController, CanvasOrderDirection } from "./Canvas";
import FontPicker from "../CustomFontPicker";
import ImageUploadModal from "../Modals/Image/ImageUploadModal";
import ExportImageModal from "../Modals/Image/ExportImageModal";
import ImportProjectModal from "../Modals/Project/ImportProjectModal";
import ExportProjectModal from "../Modals/Project/ExportProjectModal";
import "./Editor.css";

import { fabric } from "fabric";
import { google_access_key } from "../../config.json";
import ColorSelector from "../ColorSelector/SketchPicker";
import Thumbnail from "../Thumbnail/Thumbnail";
import PreviewModal from "../Modals/Image/PreviewModel";
//import { isThisTypeNode } from "typescript";

interface Props {}
interface State {
  canvasController: CanvasController;
  editorReady: boolean;
  textInput: string;
  textFont: string;
  editing: boolean;
  currentColor: string;
  selectedObjects: fabric.Object[];
  foreground: string;
  textureImgPath: string;
  tshirtId: string;
  tshirtColor: string;
  isEditableAreaVisible: boolean;
  [key: string]: any;
}

const hexToRGBA = (hex: string, alpha: number): string => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
};

class Editor extends Component<Props, State> {
  state = {
    canvasController: {} as CanvasController,
    editorReady: false,
    textInput: "",
    textFont: "Open Sans",
    editing: false,
    selectedObjects: [] as fabric.Object[],
    foreground: "#FFFFFF",
    currentColor: "rgba(255,255,255,255)",
    textureImgPath: "",
    tshirtId: "tshirt_0001",
    tshirtColor: "#333333",
    isEditableAreaVisible: false
  };

  // SH 6/5/2023
  // raising ColorSelector Event
  onHandleChangeComplete = (color: any) => {
    this.setState(
      {
        foreground: color.hex,
        currentColor: hexToRGBA(color.hex, 255),
      },
      () => {
        // Get all elements in the HTML document
        const inputElements = document.querySelectorAll("input");

        console.log("onHandleChangeComplete, inputElements: ", inputElements);
        console.log(
          "onHandleChangeComplete, selectedObjects: ",
          this.state.selectedObjects
        );

        // Check if all elements are not selected
        const allNotActive = Array.from(inputElements).every(
          (element) => !element.disabled
        );
        // only tshirt is selected in the canvas
        if (this.state.selectedObjects.length === 0 && allNotActive) {
          this.state.canvasController.updateTShirtColor(
            this.state.foreground,
            this.state.tshirtId,
          );
          this.setState({ tshirtColor: this.state.foreground});
        } else if (this.state.editing) {  // text is selected
              this.state.canvasController.updateTextColor (
                this.state.selectedObjects[0] as fabric.Textbox,
                this.state.foreground
              );
        }
      }
    );
  };

  // dom textbox onchange event
  handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("handleOnChange e.target.name: ", e.target.name);
    console.log("handleOnChange e.target.value: ", e.target.value);
    this.setState({ [e.target.name]: e.target.value });
    if (this.state.editing) {
      this.state.canvasController.updateText(
        this.state.selectedObjects[0] as fabric.Textbox,
        this.state.textInput,
        this.state.textFont,
      );
    }
  };

  syncText = (textbox:any)=> { 
    const self = this as Editor;
    textbox.on ('change', function () {
      self.setState({textInput: textbox.text})
    });
  }

  initCanvasController = (controller: CanvasController) => {
    controller.canvas.on("mouse:down", () => {
      console.log ("controller.canvas.on mouse:down");
      const selected = controller.canvas.getActiveObjects();
      const textbox = selected[0];
      const canEdit = (selected.length === 1 && textbox.isType("textbox"));
      if (selected.length > 0) {
        selected.forEach((obj)=>{
          const objBoundingBox = obj.getBoundingRect();
          console.log ("objBoundingBox: ", objBoundingBox);
        });

        console.log ('selected.length > 0, selected: ', selected);
        this.setState({
          selectedObjects: selected,
          editing: canEdit,
          textInput: canEdit ? (textbox as any).text : "",
          textFont: canEdit ? (textbox as any).fontFamily : "Open Sans",
          currentColor: canEdit
            ? (textbox as any).fill
            : "rgba(255,255,255,255)",
        }, ()=> { 
          if (canEdit)
            this.syncText(textbox);  // to ensure canvas text matches html textbox value
        });      
      } else {
        console.log ('selected.length <= 0, selected: ', selected);
        this.setState({
          selectedObjects: [],
          editing: false,
          textInput: "",
          textFont: "Open Sans",
          currentColor: "rgba(255,255,255,255)",
        });
      }
    });
    controller.canvas.on("mouse:up", () => {
      const selected = controller.canvas.getActiveObjects();
      if (selected.length > 0)
        this.setState({
          selectedObjects: selected
        });
    });

    this.setState({ canvasController: controller, editorReady: true });
  };

  render() {
    const { canvasController } = this.state;
    return (
      <div className="my-5 mx-5">
        <Row>
          <Col>
            <Canvas
              tShirtId="tshirt_0001"
              tshirt="tshirt"
              controller={(controller) => this.initCanvasController(controller)}
            />
            {/* Object options */}
            <div className="mt-3">           
              <Button
                variant="danger"
                disabled={this.state.selectedObjects.length === 0}
                onClick={() => {
                  canvasController.deleteObjects(this.state.selectedObjects);
                  this.setState({ selectedObjects: [] as fabric.Object[], textInput: "", editing: false });
                }}
              >
                <i className="fas fa-trash mr-1"></i>
                Delete Selected
              </Button>
              <ButtonGroup aria-label="change object order" className="ml-2">
                {Object.keys(CanvasOrderDirection).map((direction) => (
                  <Button
                    key={direction}
                    variant="warning"
                    disabled={this.state.selectedObjects.length === 0}
                    onClick={() =>
                      this.state.canvasController.changeObjectOrder(
                        this.state.selectedObjects,
                        direction
                      )
                    }
                  >
                    {direction}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </Col>
          <Col className="d-flex flex-column">
            <Row>
              <h1>Editor</h1>
            </Row>
            {/* Editor Panel */}
            {this.state.editorReady ? (
              <>
                <Row>
                  <ImageUploadModal
                    canvas={this.state.canvasController.canvas}
                  />
                </Row>
                <Row>
                  <Thumbnail
                    imageUrl="images/tshirt.svg"
                    handleSelection={() => {
                      this.setState({ tshirtId: "tshirt_0001" }, () => {
                        canvasController.setTShirt(this.state.tshirtId);
                      });
                    }}
                  />
                  <Thumbnail
                    imageUrl="images/tshirt2.svg"
                    handleSelection={() => {
                      this.setState({ tshirtId: "tshirt_0002" }, () => {
                        canvasController.setTShirt(this.state.tshirtId);
                      });
                    }}
                  />
                </Row>

                <Row>
                  <Thumbnail
                    imageUrl="images/textures/01.jpg"
                    handleSelection={(e: any) => {
                      // map texture
                      console.log(e.target.getAttribute("src"));
                      canvasController.updateTexture(
                        e.target.getAttribute("src"),
                        this.state.tshirtId
                      );
                    }}
                  />
                  <Thumbnail
                    imageUrl="images/textures/02.jpg"
                    handleSelection={(e: any) => {
                      canvasController.updateTexture(
                        e.target.getAttribute("src"),
                        this.state.tshirtId
                      );
                    }}
                  />
                  <Thumbnail
                    imageUrl="images/textures/03.jpg"
                    handleSelection={(e: any) => {
                      canvasController.updateTexture(
                        e.target.getAttribute("src"),
                        this.state.tshirtId
                      );
                    }}
                  />
                  <Thumbnail
                    imageUrl="images/textures/04.jpg"
                    handleSelection={(e: any) => {
                      canvasController.updateTexture(
                        e.target.getAttribute("src"),
                        this.state.tshirtId
                      );
                    }}
                  />
                  <Thumbnail
                    imageUrl="images/textures/05.jpg"
                    handleSelection={(e: any) => {
                      canvasController.updateTexture(
                        e.target.getAttribute("src"),
                        this.state.tshirtId
                      );
                    }}
                  />
                </Row>
                <Row>
                  <InputGroup className="my-3">
                    <InputGroup.Prepend>
                      <FontPicker
                        apiKey={google_access_key}
                        activeFontFamily={this.state.textFont}
                        onChange={(nextFont) => {
                          console.log ("FontPicker, textFont, setState nextFont.family: ", nextFont.family);
                          this.setState({
                            textFont: nextFont.family,
                          }, ()=>{ 
                            console.log ("FontPicker, font family changed, state: ", this.state);
                            if (this.state.editing)
                              canvasController.updateText(
                                this.state.selectedObjects[0] as fabric.Textbox,
                                this.state.textInput,
                                this.state.textFont
                              );
                          });
                        }}
                        
                        setActiveFontCallback={() => {
                           console.log ("setActiveFontCallback");
                           this.state.canvasController.canvas.renderAll();
                        }}
                      />
                    </InputGroup.Prepend>
                    <FormControl
                      placeholder={
                        !this.state.editing ? "Add Text" : "Update Text"
                      }
                      aria-label="text"
                      name="textInput"
                      onChange={this.handleOnChange}
                      value={this.state.textInput}
                      type="text"
                    />
                    <InputGroup.Prepend>
                      <Button
                        className="h-"
                        onClick={() => {
                          console.log("canvasController", canvasController);
                          console.log("state", this.state);
                          const fillColor =
                            this.state.foreground !== this.state.tshirtColor
                              ? this.state.foreground
                              : "#000000";
                          if (!this.state.editing)
                            canvasController.addText(
                              this.state.textInput,
                              this.state.textFont,
                              fillColor                            );
                          else
                            canvasController.updateText(
                              this.state.selectedObjects[0] as fabric.Textbox,
                              this.state.textInput,
                              this.state.textFont
                              //fillColor
                            );
                          this.setState({ textInput: "", editing: false });
                        }}
                      >
                        {!this.state.editing ? (
                          <>
                            <i className="fas fa-plus mr-1"></i>Add Text
                          </>
                        ) : (
                          "Update Text"
                        )}
                      </Button>
                    </InputGroup.Prepend>
                  </InputGroup>
                </Row>
                <Row className="d-flex justify-content-center">
                  <ColorSelector
                    color={this.state.foreground}
                    handleChangeComplete={(color: string) => {
                      this.onHandleChangeComplete(color);
                    }}
                  />
                </Row>
                <Row className="flex-grow-1"></Row>
                <Row className="align-self-end">
                  <PreviewModal
                    exportFunction={this.state.canvasController.exportToImage}
                  />
                  <ExportImageModal
                    exportFunction={this.state.canvasController.exportToImage}
                  />
                  <ButtonGroup className="ml-2">
                    <ExportProjectModal
                      exportFunction={this.state.canvasController.exportToJSON}
                    />
                    <ImportProjectModal
                      importFunction={
                        this.state.canvasController.importFromJSON
                      }
                    />
                  </ButtonGroup>
                <Button
                  variant="danger"
                  //disabled={this.state.selectedObjects.length === 0}
                  onClick={() => {
                    this.state.canvasController.maskEditableArea(this.state.tshirtId, this.state.selectedObjects);
                    this.state.canvasController.removeObjectsOutsideBoundary();
                    console.log ("stop here");
                  }}
                >
                {/* <i className="fas fa-trash mr-1"></i> */}
                  Mask Objects
                </Button> 
                <Button
                  variant="danger"
                  //disabled={this.state.selectedObjects.length === 0}
                  onClick={() => {
                    this.state.canvasController.removeObjectsOutsideBoundary();
                  }}
                >
                {/* <i className="fas fa-trash mr-1"></i> */}
                  Remove OFB Objects
                </Button> 
                <Button
                  variant="danger"
                  //disabled={this.state.selectedObjects.length === 0}
                  onClick={() => {
                    this.state.canvasController.unclipObjects();
                    this.state.canvasController.ungroupObjects();
                  }}
                >
                {/* <i className="fas fa-trash mr-1"></i> */}
                  Unclip mask
                </Button> 
                <Form>
                  <Form.Check 
                    type="checkbox" 
                    id="myCheckbox" 
                    label="Hide Editable Area"
                    onChange={
                      (e:any)=>{
                        const checked = e.currentTarget.checked;
                        this.state.canvasController.toggleEditableArea(checked)
                        this.setState({isEditableAreaVisible: checked})
                      } 
                    }
                    />
                </Form>
                </Row>
              </>
            ) : null}
          </Col>
        </Row>
      </div>
    );
  }
}

export default Editor;
