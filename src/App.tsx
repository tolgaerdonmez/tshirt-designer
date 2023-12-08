import React, {Component} from "react";
import Navbar from "./components/Navbar";
import Editor from "./components/Editor/Editor";
import { State, CanvasController } from "./data_type/interfaces";
import "./App.css";

import {
  DEFAULT_FG,
  DEFAULT_FONT,
  DEFAULT_TSHIRT_COLOR,
  DEFAULT_TSHIRT_ID,
  DEFAULT_FILL_COLOR
} from "./data_type/constants";
class App extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
		canvasController: {} as CanvasController,
		editorReady: false,
		textInput: "",
		textFont: DEFAULT_FONT,
		editing: false,
		selectedObjects: [] as fabric.Object[],
		foreground: DEFAULT_FG,
		currentColor: DEFAULT_FILL_COLOR,
		textureImgPath: "",
		tshirtId: DEFAULT_TSHIRT_ID,
		tshirtColor: DEFAULT_TSHIRT_COLOR,
		isEditableAreaInvisible: false,
		previewing: false,
		fillSelected: true,
		isCanvasDeselected: true
	};
  }

	handleEditorState = (editorState:Record<string, any>, callback:()=>void =()=>{})=>{
		this.setState(editorState, callback);		
	}

  render() {
    return (
		<>
			<Navbar editor={this.state} setEditor={this.handleEditorState} />
			<Editor editor={this.state} setEditor={this.handleEditorState}/> 
		</>
    );
  }
}

export default App;
