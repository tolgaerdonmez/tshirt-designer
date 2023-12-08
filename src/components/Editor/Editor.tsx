import React, { Component } from "react";
import {
  Col,
  Row,
  Form
} from "react-bootstrap";

import Canvas from "../Canvas/Canvas";
import "./Editor.css";

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
} from "../../data_type/constants";

import {State, CanvasController} from "../../data_type/interfaces";
import ObjectControlButtonsGroup from "../ObjectControlButtonsGroup/ObjectControlButtonsGroup";

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

  setEditorState = (stateProperties:object, callback?:()=>void) => {
    this.props.setEditor({...stateProperties}, callback);
  };

  // SH 6/5/2023
  // raising ColorSelector Event
  handleColorSelection = (color: any) => {
    this.props.setEditor(
      {
        foreground: color.hex,
        currentColor: hexToRGBA(color.hex, 255),
      }, () => {
        // Get all elements in the HTML document
        const inputElements = document.querySelectorAll("input");
        // Check if all elements are not selected
        const allNotActive = Array.from(inputElements).every(
          (element) => !element.disabled
        );
        // only tshirt is selected on the canvas
        if (this.props.editor.selectedObjects.length === 0 && allNotActive) {
          this.props.editor.canvasController.updateTShirtColor(
            this.props.editor.foreground,
            this.props.editor.tshirtId,
          );
          this.props.setEditor({ tshirtColor: this.props.editor.foreground});
        } else if (this.props.editor.editing) {  // text is selected
              this.props.editor.canvasController.updateTextColor (
                this.props.editor.selectedObjects[0] as fabric.Textbox,
                this.props.editor.foreground
              );
        }
        this.props.setEditor({isCanvasDeselected:false});
      });
  };

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

      if (isClickOutsideCanvas) 
        this.props.setEditor({isCanvasDeselected:true});
    });

    this.props.setEditor({ canvasController: controller, editorReady: true });
  };

  render() {
    return (
      <>
        {/* <div className="my-5 mx-5"> */}
        <div>
          <Row className="main-body">
            <Col xs={1} className="side-menu-container">
            {/* Sidebar content goes here */}
              <SideMenu canvas={this.props.editor.canvasController.canvas} editor={this.props.editor} setEditor={this.setEditorState} />
            </Col>
            <Col xs={4} className="properties-menu-container d-flex flex-column">
              {/* Editor Panel */}
              {this.props.editor.editorReady ? (
                <>
                  <Row>
                    <div className="mt-3">     
                      <ObjectControlButtonsGroup editor={this.props.editor} setEditor={this.setEditorState} />      
                    </div>
                    <div className="mt-3">  
                      {!this.props.editor.editing || (<TextEditingTool 
                        setEditor={this.setEditorState} 
                        editor={this.props.editor} 
                        />)}
                    </div>
                  </Row>
                  <Row>
                      <TShirtSelectionGroup editor={this.props.editor} setEditor={this.setEditorState} />
                  </Row>
                  <Row>
                      {
                      // (true) ||
                      (this.props.editor.fillSelected && 
                       this.props.editor.selectedObjects.length === 0 && 
                       !this.props.editor.isCanvasDeselected) && 
                        (<TextureButtonsGroup editor={this.props.editor} setEditor={this.setEditorState} />)
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
                      this.handleColorSelection(color);
                    }}
                  />)}
                  </Row>
                </>
              ) : null}
            </Col>            
            <Col xs={6} className="editor-container">
                  <Row>
                  <Form>
                    <Form.Check 
                      type="checkbox" 
                      id="myCheckbox" 
                      label="Hide Printable Area"
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
                <Canvas
                  tShirtId={DEFAULT_TSHIRT_ID}
                  tshirt="tshirt"
                  controller={(controller) => this.initCanvasController(controller)} />
                <TextLoader className="spinner-off"/>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Editor;
