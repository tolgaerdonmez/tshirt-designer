import React, {Component} from "react";
import Navbar from "./components/Navbar";
import Editor from "./components/Editor/Editor";
import { CanvasController } from "./components/Canvas/Canvas";
import State from "./interfaces/State";
import "./App.css";

import {
  DEFAULT_FG,
  DEFAULT_FONT,
  DEFAULT_TSHIRT_COLOR,
  DEFAULT_TSHIRT_ID,
  DEFAULT_FILL_COLOR
} from "./config/constants";


// function App() {
// 	const [state, setState] = useState<State>({
// 		canvasController: {} as CanvasController,
// 		editorReady: false,
// 		textInput: "",
// 		textFont: DEFAULT_FONT,
// 		editing: false,
// 		selectedObjects: [] as fabric.Object[],
// 		foreground: DEFAULT_FG,
// 		currentColor: DEFAULT_FILL_COLOR,
// 		textureImgPath: "",
// 		tshirtId: DEFAULT_TSHIRT_ID,
// 		tshirtColor: DEFAULT_TSHIRT_COLOR,
// 		isEditableAreaInvisible: false,
// 		previewing: false,
// 		fillSelected: false,
// 		isCanvasDeselected: true
// 	});

// 	//useEffect (()=>{console.log ("here")},[]);

// 	const handleEditorState = (editorState:Record<string, any>, callback:()=>void =()=>{})=>{
// 		setState((prevObject) => {  
// 			let updatedObject:string | any = { ...prevObject };
// 			Object.entries(editorState).forEach(([key, value]) => {
//         		updatedObject[key] = value;
//      		});
//     		return updatedObject;
// 		});
// 		callback();
// 	}


// 	return (
// 		<>
// 			<Navbar editor={state} />
// 			<Editor editor={state} setEditor={handleEditorState}/> 
// 			{/* <div>
// 				<p>Default Font: {state.textFont} and Text Input {state.textInput}</p>
// 				<button onClick={()=>{handleEditorState({textInput:"hello", textFont:"San Serif"})}}>Press Me</button>
// 			</div> */}
// 		</>
// 	);
// }

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
