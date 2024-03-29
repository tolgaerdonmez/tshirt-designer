import React, { Component } from "react";
import { fabric } from "fabric";
import { saveAs } from "file-saver";
import "./Canvas.css";
import { CanvasController } from "../../../data_type/interfaces";
import { CanvasOrderDirection } from "../../../data_type/constants";
import { State } from "../../../data_type/interfaces";

interface Props {
  initCanvasController: (controller: CanvasController) => void;
  editor:State;
  setEditor:(editorState:Record<string, any>, callback?:()=>void)=>void;
}
// interface State {
// }

interface IMyObjectOptions extends fabric.IObjectOptions {
  id?: string;
  name?: string;
}

// extending Rect object so attributes can be exported
//  in project files
class EditableArea extends fabric.Rect {
  id: string;
  name: string;

  constructor(options: IMyObjectOptions) {
    super(options);
    this.id = options.id || '';
    this.name = options.name || '';
  }

  toObject(propertiesToInclude: string[] = []): any {
    return super.toObject(propertiesToInclude.concat(['id', 'name']));
  }
}

// const loadImage = (url: string) => {
//     return new Promise((resolve, reject) => {
//         fabric.Image.fromURL(url, (img) => {
//             if (img) {
//                 resolve(img);
//             } else {
//                 reject(new Error('Failed to load image.'));
//             }
//         });
//     });
// }

export default class Canvas extends Component<Props, State> {
  canvas!: fabric.Canvas;

  componentDidMount() {

    const {canvasController:controller, tshirtId} = this.props.editor;
    
    //creating the canvas
    this.canvas = new fabric.Canvas("c");
    if (controller !== undefined)
      this.props.initCanvasController({ ...(this as CanvasController) });
    // setting the background image
    if (tshirtId)
      this.setBackground();
  }
  

  createEditableArea = (mask: any) => {
    const {tshirtId} = this.props.editor;
    return new EditableArea({
      left: mask.offsetLeft,
      top: mask.offsetTop,
      width: mask.w,
      height: mask.h,
      name: "editableArea",
      id: tshirtId,
      selectable: false,
      hoverCursor: 'auto',
      fill: "white",
      opacity: 0.3,
      stroke: 'black',
      strokeWidth: 2,
      strokeDashArray: [5, 2], // Dashed border pattern
    });
  }


  getItemByName(name:string) { 
    let result = null;
    this.canvas.getObjects().forEach(function (object) {
      if (object.name === name) {
        result = object;
      }
    });
    return result;
  }

  // Force re-render
  forceRender = (obj: fabric.Object) => {
    if (obj.scaleX !== undefined) { 
      const tmp = obj.scaleX;
      // Modify a property to trigger a change
      obj.set({ scaleX: obj.scaleX + 0.001 });
      
      // Set it back to its original value
      obj.set({ scaleX: obj.scaleX});
      
      // Update canvas
      this.canvas.renderAll();

      // not sure if this matters but want to set 
      // it back to its original value after force render
      obj.set({ scaleX: tmp});
    }
  }

  selectAllObjects = ()=> {
    // Deselect any currently active object
    this.canvas.discardActiveObject();

    // Select all objects on the canvas
    const allObjects = this.canvas.getObjects();
    if (allObjects.length > 0) {
      const group = new fabric.ActiveSelection(allObjects, {
        canvas: this.canvas,
      });

      this.canvas.setActiveObject(group);
      this.canvas.requestRenderAll();
    }
  }


  unclipObjects = ()=>{
    const allObjects:any = this.canvas.getObjects();
    const maskedGroup:any = allObjects.filter((obj: fabric.Object)=>obj.get('name')==='maskedGroup');
    if (maskedGroup[0]) { 
      maskedGroup[0].clipPath = null;
      this.forceRender(maskedGroup[0]);
        // Render all objects on the canvas
       this.canvas.requestRenderAll();
      }
  }
  
  ungroupObjects = () => { 
    const allObjects:any = this.canvas.getObjects();
    const maskedGroup:any = allObjects.filter((obj: fabric.Object)=>obj.get('name')==='maskedGroup');

    if (maskedGroup[0]) { 
      const centerPoint:any = { top: maskedGroup[0].top + maskedGroup[0].height / 2.0, 
                                left: maskedGroup[0].left + maskedGroup[0].width / 2.0 };
      const objectsInGroup = maskedGroup[0].getObjects();
      
      // Add each object to the canvas
      objectsInGroup.forEach((obj: fabric.Object) => {
        obj.set({top: centerPoint.top + obj.top, left: centerPoint.left + obj.left});
        this.canvas.add(obj);
      });

       // Remove the group from the canvas
      this.canvas.remove(maskedGroup[0]); 
      this.canvas.renderAll(); 
    
    }
  }

  removeObjectsOutsideBoundary = ()=> {
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    // Get all objects on the canvas
    const allObjects = this.canvas.getObjects();

    // Identify and remove objects outside the canvas boundaries
    allObjects.forEach(obj => {
      const objBoundingBox = obj.getBoundingRect();
      const objLeft = objBoundingBox.left;
      const objTop = objBoundingBox.top;
      const objRight = objLeft + objBoundingBox.width;
      const objBottom = objTop + objBoundingBox.height;

      if (objLeft < 0 || objTop < 0 || objRight > canvasWidth || objBottom > canvasHeight) {
        // Remove the object
        if (obj.get('name')!=='maskedGroup')
          this.canvas.remove(obj);
      }
    });

    // Render all objects on the canvas
    this.canvas.renderAll();
  }

  togglePrintableArea = (show:boolean) => { 
    const allObjects = this.canvas.getObjects();
    const editableArea:fabric.Object | undefined = allObjects.find((obj) => obj.name === "editableArea");
    if (editableArea) { 
      editableArea.set({visible: !show});
      this.canvas.renderAll();
    }
  }

  maskEditableArea = (objects: fabric.Object[]) => { 
    const allObjects = this.canvas.getObjects();
    let groupedObjects:any = [];
    allObjects.forEach((obj)=>{
      if (obj.get('name') !== "maskLayer" || obj.get('name') !=="editableArea")
        groupedObjects.push(obj);
    });

    const group:any = new fabric.Group(groupedObjects.slice(1));
    const editableArea:any = allObjects.find((obj) => obj.name === "editableArea");
    const groupCenterCoords:any = { top: (group.top + group.height / 2.0), left: (group.left + group.width / 2.0) };
    const maskedGroupCenterCoords:any = { top: editableArea.top - groupCenterCoords.top, 
                                        left: editableArea.left - groupCenterCoords.left, 
                                        width: editableArea.width,
                                        height: editableArea.height
                                      };

    let clipPath:any = new fabric.Rect ({...maskedGroupCenterCoords});
    group.clipPath = clipPath;
    group.set ({'name': 'maskedGroup'});
    

    this.canvas.add(group);
    this.canvas.renderAll();

    // I haven't figure out how to mask properly yet but the below lines are required
    // for a quick fix to remove extra copies of objects generated
    this.selectAllObjects();
    this.canvas.discardActiveObject();
    
    this.canvas.requestRenderAll();
  }

  setBackground = () => {

    const {tshirtId} = this.props.editor;
     
    fabric.Image.fromURL(this.getPath(), (img) => {
      const h: number = img.getScaledHeight();
      const w: number = img.getScaledWidth();
      this.canvas.setHeight(h);
      this.canvas.setWidth(w);
      
      // Set the clipPath property on the content object to use the mask
      img.set({
        left: 0,
        top: 0
      });

      //this.canvas.add(img);
      this.canvas.setBackgroundImage(img, () => { console.log ("h and w: ", h, w)});

      var retrievedObject = this.getItemByName('editableArea');
      if (retrievedObject) {
        this.canvas.remove(retrievedObject);
      }

      let mask = (tshirtId === 'tshirt_0001')?
        { w: 200, h: 300, offsetLeft: (w - 200) / 2, offsetTop: 20 + (h - 300) / 2 }:
        { w: 180, h: 275, offsetLeft: (w - 180) / 2, offsetTop: 20 + (h - 275) / 2 };
      const editableArea = this.createEditableArea(mask);

      this.canvas.add(editableArea);
      this.canvas.sendToBack(editableArea);

      // Add both the mask and content to the canvas
      this.canvas.renderAll();
    });
  };
  
  addImage = () => {
    fabric.Image.fromURL("images/logo512.png", (img: fabric.Image) => {
      this.canvas.add(img);
    });
  };

  addText = (text: string, fontFamily: string, textColor: string, setActiveText: boolean = false) => {
    const [w, h]: number[] = [this.canvas.getWidth(), this.canvas.getHeight()];
    let t = new fabric.Textbox(text, {
      left: w / 4,
      top: h / 4,
      fontFamily: fontFamily,
      fontSize: 100,
      fill: textColor,
      editable: true,
    });
    //t.set({fontFamily: fontFamily});
    this.canvas.add(t);
    if (setActiveText)
      this.canvas.setActiveObject(t);
    this.canvas.renderAll();
  };

  updateText = (
    textObj: fabric.Textbox,
    text: string,
    fontFamily: string
  ) => {
    console.log ("updateText textObj: ", textObj);
    textObj.set({ text: text, fontFamily: fontFamily});
    this.canvas.renderAll();
  };

  updateTextColor = (
    textObj: fabric.Textbox,
    textColor: string
  ) => {
    textObj.set({ fill: textColor});
    this.canvas.renderAll();
  };
  
  updateTShirtColor = (textColorHex: string) => {
    let svgUrl = this.getPath();
    const {tshirtId} = this.props.editor;
    fabric.loadSVGFromURL(svgUrl, (objects) => {
      objects.forEach((obj, i) => {
        if (
          (tshirtId === "tshirt_0001" && i === 2) ||
          (tshirtId === "tshirt_0002" && i === 0)
        )
          obj.set({ fill: textColorHex });
      });
      const svg = fabric.util.groupSVGElements(objects);
      const svgDataUrl = svg.toDataURL({ format: "png" });
      this.canvas.setBackgroundImage(
        svgDataUrl,
        this.canvas.renderAll.bind(this.canvas)
      );
    });
  };

  updateTexture = (textureImgPath: string) => {
    const {tshirtId} = this.props.editor;
    const svgName = tshirtId + "_fill";
    // Get all objects on the canvas
    const objects = this.canvas.getObjects();

    // Find the SVG object by name
    const svgObject = objects.find((obj) => obj.name === svgName);

    if (svgObject)
      // SVG object found, remove it from the canvas
      this.canvas.remove(svgObject);

    let svgUrl = this.getPath();
    fabric.loadSVGFromURL(svgUrl, (objects) => {
      fabric.util.loadImage(textureImgPath, (img) => {
        objects.forEach((obj, i) => {
          // i is the layer of the svg that the 
          // texture will be mapped to
          if (
            (tshirtId === "tshirt_0001" && i === 2) ||
            (tshirtId === "tshirt_0002" && i === 0)
          )
            obj.set(
              "fill",
              new fabric.Pattern({
                source: img,
                repeat: "repeat",
              })
            );
        });
        const svg = fabric.util.groupSVGElements(objects);
        //svg.selectable = false;
        //svg.name = svgName;

        //this.canvas.add(svg);
        //this.changeObjectOrder(this.canvas.getObjects(), "back");
        const svgDataUrl = svg.toDataURL({ format: "png" });
        this.canvas.setBackgroundImage(
          svgDataUrl,
          this.canvas.renderAll.bind(this.canvas)
        );
        //this.canvas.renderAll();
      });
    });
  };

  getPath = () => {
    const {tshirtId} = this.props.editor;
    switch (tshirtId) {
      case "tshirt_0001":
        return "images/tshirt.svg";
      case "tshirt_0002":
        return "images/tshirt2.svg";
      default:
        return "";
    }
  };

  deleteObjects = (objects: fabric.Object[]) => {
    objects.forEach((object) => this.canvas.remove(object));
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  };

  changeObjectOrder = (
    objects: fabric.Object[],
    direction: CanvasOrderDirection | string
  ) => {
    switch (direction) {
      case CanvasOrderDirection.backwards:
        objects.forEach((object) => this.canvas.sendBackwards(object));
        break;
      case CanvasOrderDirection.forwards:
        objects.forEach((object) => this.canvas.bringForward(object));
        break;
      case CanvasOrderDirection.back:
        objects.forEach((object) => this.canvas.sendToBack(object));
        break;
      case CanvasOrderDirection.front:
        objects.forEach((object) => this.canvas.bringToFront(object));
        break;
      default:
        break;
    }
    
    var retrievedObject = this.getItemByName('editableArea');
    if (retrievedObject) {
      this.canvas.sendToBack(retrievedObject);
    }

    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  };

  // lock meaning not editable
  lock = () => { 
    this.canvas.getObjects().forEach(obj => {
      obj.evented = false;
    });
  }

  // unlock meaning editable
  unlock = () => { 
    this.canvas.getObjects().forEach(obj => {
      obj.evented = true;
    });
  }

  exportToImage = (
    format: string,
    fileName: string = "design",
    includeBackground?: boolean
  ) => {
    try {
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
      if (!includeBackground) {
        this.canvas.backgroundImage = undefined;
        this.canvas.renderAll();
        this.canvas.getElement().toBlob((data: any) => {
          saveAs(data, fileName + "." + format);
        });
        this.setBackground();
      } else {
        this.canvas.renderAll();
        this.canvas.getElement().toBlob((data: any) => {
          saveAs(data, fileName + "." + format);
        });
      }
    } catch (error) {
      window.alert("Try downloading again!");
    }
  };

  exportToJSON = (fileName: string) => {
    try {
      fileName = fileName.replace(/([^a-z0-9 ]+)/gi, "-");
      const data = JSON.stringify(this.canvas.toJSON());
      var blob = new Blob([data], { type: "application/json" });
      saveAs(blob, fileName + ".tdp");
    } catch (error) {
      window.alert("Try downloading again!");
    }
  };

  // ()=>{
  //   const {canvasController:controller, tshirtId} = this.props.editor;
  //   if (controller !== undefined)
  //     this.props.initCanvasController({ ...(this as CanvasController) });
  //   // setting the background image
  //   if (tshirtId)
  //     this.setBackground();
  // }
  importFromJSON = (json: object | fabric.Object) => {
    const {setEditor} = this.props;
    const {objects} = (json as any);
    if (objects) {
        objects.forEach(({id:tshirtId}:any)=>{
          if (tshirtId === "tshirt_0001" || tshirtId === "tshirt_0002") {
            setEditor({tshirtId:tshirtId, 
                      loadFromJSON: true, 
                      json: JSON.parse(JSON.stringify(json)) 
                    });
            // see useEffect in App.tsx 
            return true;
          }  
      });

    }
  };

  render() {
    return <canvas id="c" style={{ border: "2px solid black" }} />;
  }
}
