import { CanvasOrderDirection } from "./constants";

export interface CanvasController {
  canvas: fabric.Canvas;
  getItemByName: (name: string) => any;
  getPath:()=>string;
  setBackground: () => void;
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
  updateTexture: (textureImgPath: string) => void;
  updateTShirtColor: (textColorHex: string) => void;
  exportToJSON: (fileName: string) => void;
  importFromJSON: (json: object | fabric.Object) => void;
  maskEditableArea: (objects: fabric.Object[]) => void;
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
  foregroundColor: string;
  selectedObjects: fabric.Object[];
  textureImgPath: string;
  tshirtId: string;
  tshirtColor: string;
  isEditableAreaInvisible: boolean;
  previewing: boolean;
  fillSelected: boolean;
  isCanvasDeselected: boolean;
  loadFromJSON: boolean;
  json: object | fabric.Object;
  callback:()=>void;
  [key: string]: any;
}