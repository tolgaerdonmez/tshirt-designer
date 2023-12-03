import React, { Component, ChangeEvent } from "react";
import {
  Col,
  Row,
  Button,
  ButtonGroup,
  Form
} from "react-bootstrap";

import Canvas, { CanvasController, CanvasOrderDirection } from "../Canvas/Canvas";
import ExportImageModal from "../Modals/Image/ExportImageModal";
import ImportProjectModal from "../Modals/Project/ImportProjectModal";
import ExportProjectModal from "../Modals/Project/ExportProjectModal";
import "./Editor.css";

import { fabric } from "fabric";
import ColorSelector from "../ColorSelector/SketchPicker";
import Thumbnail from "../Thumbnail/Thumbnail";
// import PreviewModal from "../Modals/Image/PreviewModel";
import TextEditingTool from "../TextEditingTool/TextEditingTool";
import SideMenu from "../SideMenu/SideMenu";
import TextLoader from "../TextLoader/TextLoader";

import {
  DEFAULT_FG,
  DEFAULT_FONT,
  DEFAULT_TSHIRT_COLOR,
  DEFAULT_TSHIRT_ID,
  Color
} from "../../config/constants";

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
  isEditableAreaInvisible: boolean;
  previewing: boolean
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
    textFont: DEFAULT_FONT,
    editing: false,
    selectedObjects: [] as fabric.Object[],
    foreground: DEFAULT_FG,
    currentColor: Color.white,
    textureImgPath: "",
    tshirtId: DEFAULT_TSHIRT_ID,
    tshirtColor: DEFAULT_TSHIRT_COLOR,
    isEditableAreaInvisible: false,
    previewing: false
  };

  syncText = (textbox:any)=> { 
    const self = this as Editor;
    textbox.on ('change', function () {
      self.setState({textInput: textbox.text})
    });
  }

  preview = () => { 
    this.setState({previewing: !this.state.previewing}, ()=>{
      if (this.state.previewing) {
        this.state.canvasController.maskEditableArea(this.state.tshirtId, this.state.selectedObjects);
        // Trying to figure out why it creats copies of objects 
        // and place the objects centered at (0,0)
        this.state.canvasController.removeObjectsOutsideBoundary();
      }
      else {
        this.state.canvasController.unclipObjects();
        this.state.canvasController.ungroupObjects();
      }
      this.state.canvasController.toggleEditableArea(this.state.previewing)
      this.setState({isEditableAreaInvisible: this.state.previewing})
      this.state.canvasController.canvas.renderAll();
    });
  }

  setEditorState = (stateProperties:object, callback?:()=>void) => {
    this.setState({...stateProperties}, callback);
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
    loadFont = () => {
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
          this.state.canvasController.forceRender(this.state.selectedObjects[0]);
          const textLoader:Element = document.getElementsByClassName (`${textLoaderClass}on`)[0];
          if (textLoader)
              textLoader.className = `${textLoaderClass}off`;
      }, 2000);
    }

  initCanvasController = (controller: CanvasController) => {
    controller.canvas.on("mouse:down", () => {
      const selected = controller.canvas.getActiveObjects();
      const textbox = selected[0];
      const canEdit = (selected.length === 1 && textbox.isType("textbox"));
      if (selected.length > 0) {
        this.setState({
          selectedObjects: selected,
          editing: canEdit,
          textInput: canEdit ? (textbox as any).text : "",
          textFont: canEdit ? (textbox as any).fontFamily : DEFAULT_FONT,
          currentColor: canEdit
            ? (textbox as any).fill
            : Color.white,
        }, ()=> { 
          if (canEdit)
            this.syncText(textbox);  // to ensure canvas text matches html textbox value
        });      
      } else {
        this.setState({
          selectedObjects: [],
          editing: false,
          textInput: "",
          textFont: DEFAULT_FONT,
          currentColor: Color.white,
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
      <>
        {/* <div className="my-5 mx-5"> */}
        <div>
          <Row className="main-body">
            <Col xs={1} className="side-menu-container">
            {/* Sidebar content goes here */}
              <SideMenu canvas={this.state.canvasController.canvas} editor={this.state} setEditor={this.setEditorState} />
            </Col>
            <Col xs={4} className="properties-menu-container d-flex flex-column">
              <Row>
                <h1>Editor</h1>
              </Row>
              {/* Editor Panel */}
              {this.state.editorReady ? (
                <>
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
                  <Row className="d-flex justify-content-center">
                    <ColorSelector
                      color={this.state.foreground}
                      handleChangeComplete={(color: string) => {
                        this.onHandleChangeComplete(color);
                      }}
                    />
                  </Row>
                  <Row className="align-self-end">
                    <button onClick={this.preview}>Preview</button>
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
                  <Form>
                    <Form.Check 
                      type="checkbox" 
                      id="myCheckbox" 
                      label="Hide Editable Area"
                      onChange={
                        (e:React.ChangeEvent<HTMLInputElement>)=>{
                          const checked = e.currentTarget.checked;
                          this.state.canvasController.toggleEditableArea(checked)
                          this.setState({isEditableAreaInvisible: checked})
                        } 
                      }
                      />
                  </Form>
                  </Row>
                </>
              ) : null}
            </Col>            
            <Col xs={6} className="editor-container">
                <Canvas
                  tShirtId="tshirt_0001"
                  tshirt="tshirt"
                  controller={(controller) => this.initCanvasController(controller)} />
                <TextLoader className="spinner-off"/>
                <div className="mt-3">           
                <Button
                  variant="danger"
                  disabled={this.state.selectedObjects.length === 0}
                  onClick={() => {
                    canvasController.deleteObjects(this.state.selectedObjects);
                    this.setState({ selectedObjects: [] as fabric.Object[], textInput: "", editing: false });
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
              <div className="mt-3">  
                <TextEditingTool 
                  setEditor={this.setEditorState} 
                  editor={this.state} 
                  loadFont={this.loadFont} 
                  visible={this.state.editing} />
              </div>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Editor;
