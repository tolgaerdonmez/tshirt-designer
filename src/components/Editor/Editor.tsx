import React, { Component } from "react";
import {
  Col,
  Row
} from "react-bootstrap";

import Canvas from "./Canvas/Canvas";
import "./Editor.css";

import ColorSelector from "./ColorSelector/SketchPicker";
import TextEditingTool from "./TextEditingTool/TextEditingTool";
import SideMenu from "../SideMenu/SideMenu";
import TextLoader from "./TextLoader/TextLoader";
import TextureButtonsGroup from "./TextureButtonsGroup/TextureButtonsGroup";
import HidePrintableAreaSwitch from "./HidePrintableAreaSwitch/HidePrintableAreaSwitch";

import {
  DEFAULT_FG,
  DEFAULT_FONT,
} from "../../data_type/constants";

import {State, CanvasController} from "../../data_type/interfaces";
import ObjectControlButtonsGroup from "./ObjectControlButtonsGroup/ObjectControlButtonsGroup";

interface Props {
  editor:State;
  setEditor:(editorState:Record<string, any>, callback?:()=>void)=>void;
}

// const hexToRGBA = (hex: string, alpha: number): string => {
//   let r = parseInt(hex.slice(1, 3), 16);
//   let g = parseInt(hex.slice(3, 5), 16);
//   let b = parseInt(hex.slice(5, 7), 16);
//   return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
// };
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

  handleColorSelection = (color: any) => {
    this.props.setEditor(
      {
        foregroundColor: color.hex,
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
            this.props.editor.foregroundColor
          );
          this.props.setEditor({ tshirtColor: this.props.editor.foregroundColor});
        } else if (this.props.editor.editing) {  // text is selected
              this.props.editor.canvasController.updateTextColor (
                this.props.editor.selectedObjects[0] as fabric.Textbox,
                this.props.editor.foregroundColor
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
          foregroundColor: canEdit
            ? (textbox as any).fill
            : DEFAULT_FG,
        }, ()=> { 
          if (canEdit)
            this.syncText(textbox);  // sync canvas text and html textbox value
        });      
      } else {
        this.props.setEditor({
          selectedObjects: [],
          editing: false,
          textInput: "",
          textFont: DEFAULT_FONT,
          foregroundColor: DEFAULT_FG,
        });
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
              {this.props.editor.editorReady && (
                <>
                  <Row>
                      <div className="mt-3">     
                        <ObjectControlButtonsGroup editor={this.props.editor} setEditor={this.setEditorState} />      
                      </div>
                  </Row>
                  <Row>
                    <div className="mt-3">  
                      {!this.props.editor.editing || (<TextEditingTool 
                        setEditor={this.setEditorState} 
                        editor={this.props.editor} 
                        />)}
                    </div>
                  </Row>
                  <Row className="d-flex">
                  {
                  /* Need to check whether fabric object type is text or canvas */
                  (this.props.editor.fillSelected && !this.props.editor.isCanvasDeselected) &&
                  (<ColorSelector
                    color={this.props.editor.foregroundColor}
                    handleChangeComplete={(color: string) => {
                      this.handleColorSelection(color);
                    }}
                  />)}
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
                </>
              )}
            </Col>            
            <Col xs={6} className="editor-container">
                  <Row>
                    <HidePrintableAreaSwitch editor={this.props.editor} setEditor={this.props.setEditor} />
                  </Row>              
                <Canvas
                  initCanvasController={(controller) => this.initCanvasController(controller)} 
                  editor={this.props.editor}
                  setEditor={this.props.setEditor} />
                <TextLoader className="spinner-off"/>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Editor;
