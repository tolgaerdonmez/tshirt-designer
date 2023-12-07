import { CanvasController } from "../components/Canvas/Canvas";

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
  previewing: boolean,
  fillSelected: boolean,
  isCanvasDeselected: boolean,
  [key: string]: any;
}

export default State;