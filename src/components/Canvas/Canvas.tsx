import React, { Component } from "react";
import { fabric } from "fabric";
import { saveAs } from "file-saver";
import "./Canvas.css";

export interface CanvasController {
  canvas: fabric.Canvas;
  getItemByName: (name: string) => any;
  setBackground: (tShirtId: string) => void;
  setTShirt: (tShirtId: string) => void;
  addImage: () => void;
  addText: (text: string, fontFamily: string, textColor: string) => void;
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
  toggleEditableArea: (show:boolean)=> void;
  forceRender: (obj:fabric.Object)=>void;
}

export enum CanvasOrderDirection {
  backwards = "backwards",
  forwards = "forwards",
  back = "back",
  front = "front",
}

interface Props {
  tShirtId: string;
  tshirt?: string;
  controller?: (controller: CanvasController) => void;
}
interface State {
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

const createEditableArea = (mask: any) => {
  return new fabric.Rect({
    left: mask.offsetLeft,
    top: mask.offsetTop,
    width: mask.w,
    height: mask.h,
    name: "editableArea",
    selectable: false,
    hoverCursor: 'auto',
    fill: "white",
    opacity: 0.3,
    stroke: 'black',
    strokeWidth: 2,
    strokeDashArray: [5, 2], // Dashed border pattern
  });
}
export default class Canvas extends Component<Props, State> {
  canvas!: fabric.Canvas;

  componentDidMount() {
    //creating the canvas
    //this.canvas = new fabric.Canvas("c", { renderOnAddRemove: true });
    this.canvas = new fabric.Canvas("c");
    if (this.props.controller !== undefined)
      this.props.controller({ ...(this as CanvasController) });
    // setting the background image
    if (this.props.tshirt !== undefined)
      this.setBackground(this.props.tShirtId);
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

  toggleEditableArea = (show:boolean) => { 
    const allObjects = this.canvas.getObjects();
    const editableArea:fabric.Object | undefined = allObjects.find((obj) => obj.name === "editableArea");
    if (editableArea) { 
      editableArea.set({visible: !show});
      this.canvas.renderAll();
    }
  }

  maskEditableArea = (tShirtId: string, objects: fabric.Object[]) => { 
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

  setBackground = (tShirtId: string) => {
    
    fabric.Image.fromURL(this.getPathById(tShirtId), (img) => {
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

      let mask = (tShirtId === 'tshirt_0001')?
        { w: 200, h: 300, offsetLeft: (w - 200) / 2, offsetTop: 20 + (h - 300) / 2 }:
        { w: 180, h: 275, offsetLeft: (w - 180) / 2, offsetTop: 20 + (h - 275) / 2 };
      const editableArea = createEditableArea(mask);

      this.canvas.add(editableArea);
      this.canvas.sendToBack(editableArea);

      // Add both the mask and content to the canvas
      this.canvas.renderAll();
    });
  };

  setTShirt = (tShirtId: string) => {
    this.setBackground(tShirtId);
  };
  
  addImage = () => {
    fabric.Image.fromURL("images/logo512.png", (img: fabric.Image) => {
      this.canvas.add(img);
    });
  };

  addText = (text: string, fontFamily: string, textColor: string) => {
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
    this.canvas.renderAll();
  };

  updateText = (
    textObj: fabric.Textbox,
    text: string,
    fontFamily: string
  ) => {
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
  
  updateTShirtColor = (textColorHex: string, tshirtId: string) => {
    let svgUrl = this.getPathById(tshirtId);
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

  updateTexture = (textureImgPath: string, tshirtId: string) => {
    const svgName = tshirtId + "_fill";
    // Get all objects on the canvas
    const objects = this.canvas.getObjects();

    // Find the SVG object by name
    const svgObject = objects.find((obj) => obj.name === svgName);

    if (svgObject)
      // SVG object found, remove it from the canvas
      this.canvas.remove(svgObject);

    let svgUrl = this.getPathById(tshirtId);
    fabric.loadSVGFromURL(svgUrl, (objects) => {
      fabric.util.loadImage(textureImgPath, (img) => {
        objects.forEach((obj, i) => {
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

  getPathById = (id: string) => {
    switch (id) {
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
        this.setBackground(this.props.tShirtId);
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

  importFromJSON = (json: object | fabric.Object) => {
    this.canvas.loadFromJSON(json, () => {
      this.canvas.renderAll();
    });
  };

  render() {
    return <canvas id="c" style={{ border: "2px solid black" }} />;
  }
}
