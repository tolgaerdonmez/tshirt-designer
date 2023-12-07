import React, { Component } from "react";
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
// import PreviewModal from "../Modals/Image/PreviewModel";
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

// interface Props {
//   editor:Object;
//   setEditor: (state:Record<string, any>, callback?:()=>void)=>void;
// }

interface Props {
  editor:State;
  setEditor:(editorState:Record<string, any>, callback?:()=>void)=>void;
}

const hexToRGBA = (hex: string, alpha: number): string => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
};
class Editor extends Component<Props, State> {

  syncText = (textbox:any)=> { 
    const self = this as Editor;
    textbox.on ('change', function () {
      self.props.setEditor({textInput: textbox.text})
    });
  }

  preview = () => { 
    this.props.setEditor({previewing: !this.props.editor.previewing}, ()=>{
      if (this.props.editor.previewing) {
        this.props.editor.canvasController.maskEditableArea(this.props.editor.tshirtId!, this.props.editor.selectedObjects!);
        // Trying to figure out why it creats copies of objects 
        // and place the objects centered at (0,0)
        this.props.editor.canvasController.removeObjectsOutsideBoundary();
      }
      else {
        this.props.editor.canvasController.unclipObjects();
        this.props.editor.canvasController.ungroupObjects();
      }
      this.props.editor.canvasController.toggleEditableArea(this.props.editor.previewing!)
      this.props.setEditor({isEditableAreaInvisible: this.props.editor.previewing})
      this.props.editor.canvasController.canvas.renderAll();
    });
  }

  setEditorState = (stateProperties:object, callback?:()=>void) => {
    this.props.setEditor({...stateProperties}, callback);
  };

  // SH 6/5/2023
  // raising ColorSelector Event
  onHandleChangeComplete = (color: any) => {
    this.props.setEditor(
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
        if (this.props.editor.selectedObjects!.length === 0 && allNotActive) {
          this.props.editor.canvasController!.updateTShirtColor(
            this.props.editor.foreground!,
            this.props.editor.tshirtId!,
          );
          this.props.setEditor({ tshirtColor: this.props.editor.foreground});
        } else if (this.props.editor.editing) {  // text is selected
              this.props.editor.canvasController!.updateTextColor (
                this.props.editor.selectedObjects![0] as fabric.Textbox,
                this.props.editor.foreground!
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
          this.props.editor.canvasController!.forceRender(this.props.editor.selectedObjects![0]);
          const textLoader:Element = document.getElementsByClassName (`${textLoaderClass}on`)[0];
          if (textLoader)
              textLoader.className = `${textLoaderClass}off`;
      }, 2000);
    }

  initCanvasController = (controller: CanvasController) => {
    const self = this as Editor;
    controller.canvas.on("mouse:down", () => {
      const selected = controller.canvas.getActiveObjects();
      const textbox = selected[0];
      const canEdit = (selected.length === 1 && textbox.isType("textbox"));
      if (selected.length > 0) {
        this.props.setEditor({
          selectedObjects: selected,
          editing: canEdit,
          textInput: canEdit ? (textbox as any).text : "",
          textFont: canEdit ? (textbox as any).fontFamily : DEFAULT_FONT,
          currentColor: canEdit
            ? (textbox as any).fill
            : DEFAULT_FILL_COLOR,
        }, ()=> { 
          if (canEdit)
            this.syncText(textbox);  // to ensure canvas text matches html textbox value
        });      
      } else {
        this.props.setEditor({
          selectedObjects: [],
          editing: false,
          textInput: "",
          textFont: DEFAULT_FONT,
          currentColor: DEFAULT_FILL_COLOR,
        });
        // console.log ('mouse:down, isCanvasDeselected: ', self.state.isCanvasDeselected);
        // console.log ('fillSelected: ', self.state.fillSelected);
      }
      self.props.setEditor({ isCanvasDeselected: false});
    });
    controller.canvas.on("mouse:up", () => {
      const selected = controller.canvas.getActiveObjects();
      if (selected.length > 0)
        this.props.setEditor({
          selectedObjects: selected
        });
    }); 
    controller.canvas.on('selection:created', function () {
      self.props.setEditor({ isCanvasDeselected: false}, ()=>{
              console.log ('selection:created, isCanvasDeselected: ', self.props.editor.isCanvasDeselected);
      console.log ('fillSelected: ', self.props.editor.fillSelected);
      });
    });


    // controller.canvas.on('selection:updated', () => {
    //   // const activeObjects = controller.canvas.getActiveObjects();

    //   // if (activeObjects.length === 0) {
    //   //   this.props.setEditor({isCanvasDeselected: true});
    //   // } else {
    //   //   this.props.setEditor({isCanvasDeselected: false});
    //   // }
    //   this.props.setEditor({isCanvasDeselected: false});
    //   console.log ('selection:updated, isCanvasDeselected: ', self.state.isCanvasDeselected);
    // });

    document.addEventListener('click', (event:MouseEvent) => {
      const canvas = this.props.editor.canvasController.canvas;
      const canvasRect = canvas.getElement().getBoundingClientRect();
      const isClickOutsideCanvas = (
        event.clientX < canvasRect.left ||
        event.clientX > canvasRect.right ||
        event.clientY < canvasRect.top ||
        event.clientY > canvasRect.bottom
      );

      if (isClickOutsideCanvas) {
        // if fill button is clicked and selected 
        //canvas.discardActiveObject().requestRenderAll();
        this.props.setEditor({isCanvasDeselected:true}, ()=>{ 
          console.log('Clicked outside canvas, isCanvasDeselected: ', this.props.editor.isCanvasDeselected);
          console.log ('fillSelected: ', this.props.editor.fillSelected);
        });
        
      }
    });

    this.props.setEditor({ canvasController: controller, editorReady: true });
  };

  render() {
    const { canvasController } = this.props.editor;
    return (
      <>
        {/* <div className="my-5 mx-5"> */}
        <div>
          <Row className="main-body">
            <Col xs={1} className="side-menu-container">
            {/* Sidebar content goes here */}
              <SideMenu canvas={this.props.editor.canvasController!.canvas} editor={this.props.editor} setEditor={this.setEditorState} />
            </Col>
            <Col xs={4} className="properties-menu-container d-flex flex-column">
              {/* Editor Panel */}
              {this.props.editor.editorReady ? (
                <>
                  <Row>
                      <TShirtSelectionGroup editor={this.props.editor} setEditor={this.setEditorState} />
                  </Row>
                  <Row>
                      {
                      // (true) ||
                      (this.props.editor.fillSelected && 
                       this.props.editor.selectedObjects!.length === 0 && 
                       !this.props.editor.isCanvasDeselected) && 
                        (<TextureButtonsGroup editor={this.props.editor} />)
                      }
                  </Row>
                  <Row className="d-flex">
                    {/* fillSelected and !isCanvasDeselected */}
                  {
                  /* ***** Need to check type is text or canvas */
                  (this.props.editor.fillSelected && !this.props.editor.isCanvasDeselected) &&
                  (<ColorSelector
                    color={this.props.editor.foreground}
                    handleChangeComplete={(color: string) => {
                      this.onHandleChangeComplete(color);
                    }}
                  />)}
                  </Row>
                  <Row className="align-self-end">
                    <Button variant="light" onClick={this.preview}>Preview</Button>
                    {/* <ExportImageModal
                      exportFunction={this.props.editor.canvasController.exportToImage}
                    />
                    <ButtonGroup className="ml-2">
                      <ExportProjectModal
                        exportFunction={this.props.editor.canvasController.exportToJSON}
                      />
                      <ImportProjectModal
                        importFunction={
                          this.props.editor.canvasController.importFromJSON
                        }
                      />
                    </ButtonGroup> */}
                  <Form>
                    <Form.Check 
                      type="checkbox" 
                      id="myCheckbox" 
                      label="Hide Editable Area"
                      onChange={
                        (e:React.ChangeEvent<HTMLInputElement>)=>{
                          const checked = e.currentTarget.checked;
                          this.props.editor.canvasController!.toggleEditableArea(checked)
                          this.props.setEditor({isEditableAreaInvisible: checked})
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
                  tShirtId={DEFAULT_TSHIRT_ID}
                  tshirt="tshirt"
                  controller={(controller) => this.initCanvasController(controller)} />
                <TextLoader className="spinner-off"/>
                <div className="mt-3">           
                <Button
                  variant="danger"
                  disabled={this.props.editor.selectedObjects!.length === 0}
                  onClick={() => {
                    canvasController!.deleteObjects(this.props.editor.selectedObjects!);
                    this.props.setEditor({ selectedObjects: [] as fabric.Object[], textInput: "", editing: false });
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
                      disabled={this.props.editor.selectedObjects!.length === 0}
                      onClick={() =>
                        this.props.editor.canvasController!.changeObjectOrder(
                          this.props.editor.selectedObjects!,
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
                {!this.props.editor.editing || (<TextEditingTool 
                  setEditor={this.setEditorState} 
                  editor={this.props.editor} 
                  loadFont={this.loadFont} 
                  />)}
              </div>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Editor;
