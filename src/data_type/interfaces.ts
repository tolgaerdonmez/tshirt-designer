import { CanvasOrderDirection } from "./constants";

export interface CanvasController {
  canvas: fabric.Canvas;
  getItemByName: (name: string) => any;
  setBackground: (tShirtId: string) => void;
  setTShirt: (tShirtId: string) => void;
  addImage: () => void;
  addText: (text: string, fontFamily: string, textColor: string, setActiveText?: boolean) => void;
  updateText: (
    textObj: fabric.Textbox,
    text: string,
    fontFamily: string
  ) => void;
  updateTextColor: (
    textObj: fabric.Textbox,
    textColor: string
  ) => void;
  deleteObjects: (objects: fabric.Object[]) => void;
  changeObjectOrder: (
    object: fabric.Object[],
    direction: CanvasOrderDirection | string
  ) => void;
  exportToImage: (
    format: string,
    fileName?: string,
    includeBackground?: boolean
  ) => void;
  updateTexture: (textureImgPath: string, tshirtId: string) => void;
  updateTShirtColor: (textColorHex: string, tshirtId: string) => void;
  exportToJSON: (fileName: string) => void;
  importFromJSON: (json: object | fabric.Object) => void;
  maskEditableArea: (tShirtId: string, objects: fabric.Object[]) => void;
  removeObjectsOutsideBoundary: () => void;
  unclipObjects: ()=> void;
  ungroupObjects:()=> void;
  togglePrintableArea: (show:boolean)=> void;
  forceRender: (obj:fabric.Object)=>void;
  lock: ()=>void;
  unlock: ()=>void;
}

export interface State {
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
  previewing: boolean;
  fillSelected: boolean;
  isCanvasDeselected: boolean;
  callback:()=>void;
  [key: string]: any;
}