import React, { Component } from "react";
import { fabric } from "fabric";
import { saveAs } from "file-saver";

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
}

export enum CanvasOrderDirection {
  backwards = "backwards",
  forwards = "forwards",
  back = "back",
  front = "front",
}

export enum Color {
  white = "rgba(255, 255, 255, 255)",
  black = "rgba(0, 0, 0, 0)",
}

interface Props {
  tShirtId: string;
  tshirt?: string;
  controller?: (controller: CanvasController) => void;
}
interface State {}


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

const createMaskArea = (mask: any) => {
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
// just for test
const createMask = (mask: any) => {
  return new fabric.Rect({
    left: mask.offsetLeft,
    top: mask.offsetTop,
    width: mask.w,
    height: mask.h,
    name: "maskLayer"
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

  // deleteObjectsOutsideBoundary = ()=>{
  //   const canvasWidth = this.canvas.getWidth();
  //   const canvasHeight = this.canvas.getHeight();

  //   // Get all objects on the canvas
  //   const allObjects = this.canvas.getObjects();

  //   // Filter out objects outside the canvas boundaries
  //   const objectsInsideBoundary = allObjects.filter(obj => {
  //     const objBoundingBox = obj.getBoundingRect();
  //     console.log ('objBoundingBox: ', objBoundingBox);
  //     const objLeft = objBoundingBox.left;
  //     const objTop = objBoundingBox.top;
  //     const objRight = objLeft + objBoundingBox.width;
  //     const objBottom = objTop + objBoundingBox.height;

  //     return objLeft >= 0 && objTop >= 0 && objRight <= canvasWidth && objBottom <= canvasHeight;
  //   });

  //   // Remove all objects from the canvas
  //   this.canvas.clear();
  //   console.log ('objectsInsideBoundary: ', objectsInsideBoundary);
  //   // Add objects inside the boundary back to the canvas
  //   this.canvas.add(...objectsInsideBoundary);

  //   // Render all objects on the canvas
  //   this.canvas.renderAll();
  // }

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
      this.canvas.remove(obj);
    }
  });

  // Render all objects on the canvas
  this.canvas.renderAll();
}


  /**** working on mask function  */
  /**** version 1 */
  maskEditableArea = (tShirtId: string, objects: fabric.Object[]) => { 
    const w: number = this.canvas.getWidth(),
          h: number = this.canvas.getHeight();
    // const mask = {w: 50, h: 50, offsetLeft: 0, offsetTop: 0};
    let mask = (tShirtId === 'tshirt_0001') ?
      { w: 200, h: 200, offsetLeft: 0, offsetTop: 0 } :
      { w: 180, h: 275, offsetLeft: (w - 180) / 2, offsetTop: 20 + (h - 275) / 2 };
    const clipPath = createMask(mask);

    const allObjects = this.canvas.getObjects();
    let groupedObjects:any = [];
    allObjects.forEach((object)=>{
      if (object.get('name') !== "maskLayer" || object.get('name') !=="maskedArea")
        groupedObjects.push(object);
    });

    groupedObjects.forEach((object: any)=>{
      console.log ("object: ", object);
    });
    //const clipPathGroup = new fabric.Group(groupedObjects, { originX: 'left', originY: 'top' });
    const group = new fabric.Group(groupedObjects.slice(1));
    clipPath.set({left: -100, top: -100});
    group.clipPath = clipPath;
    this.canvas.add(group);
    this.canvas.renderAll();

    // I haven't figure out how to mask properly yet but the below lines are required
    // for a quick fix to remove extra objects generated
    this.selectAllObjects();
    this.canvas.discardActiveObject();
    //this.removeObjectsOutsideBoundary();

    //this.canvas.renderAll();
    this.canvas.requestRenderAll();
  }

  setBackground = (tShirtId: string) => {
    
    fabric.Image.fromURL(this.getPathById(tShirtId), (img) => {
      console.log("set background tshirt id: ", this.getPathById(tShirtId));
      //img.center();
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
        console.log('Retrieved object:', retrievedObject);
        this.canvas.remove(retrievedObject);
      }

      let mask = (tShirtId === 'tshirt_0001')?
        { w: 200, h: 300, offsetLeft: (w - 200) / 2, offsetTop: 20 + (h - 300) / 2 }:
        { w: 180, h: 275, offsetLeft: (w - 180) / 2, offsetTop: 20 + (h - 275) / 2 };
      const editableArea = createMaskArea(mask);

      this.canvas.add(editableArea);
      this.canvas.sendToBack(editableArea);

      // Add both the mask and content to the canvas
      this.canvas.renderAll()
    });
  };

  setTShirt = (tShirtId: string) => {
    this.setBackground(tShirtId);
  };
  
  addImage = () => {
    console.log("adding image");
    fabric.Image.fromURL("images/logo512.png", (img: fabric.Image) => {
      this.canvas.add(img);
    });
  };

  addText = (text: string, fontFamily: string, textColor: string) => {
    console.log ("addText, fontFamily: ", fontFamily);
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
    console.log("Update Text, fontFamily: ", fontFamily);
    textObj.set({ text: text, fontFamily: fontFamily});
    this.canvas.renderAll();
  };

  updateTextColor = (
    textObj: fabric.Textbox,
    textColor: string
  ) => {
    console.log("Update Text Color, textColor: ", textColor);
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
    console.log("updateTShirtColor, tshirtId: ", tshirtId);
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
    console.log("updateTexture, tshirtId: ", tshirtId);
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
      console.log(error);
      window.alert("Try downloading again!");
    }
  };

  exportToJSON = (fileName: string) => {
    try {
      fileName = fileName.replace(/([^a-z0-9 ]+)/gi, "-");
      const data = JSON.stringify(this.canvas.toJSON());
      var blob = new Blob([data], { type: "application/json" });
      console.log(data);
      saveAs(blob, fileName + ".tdp");
    } catch (error) {
      console.log(error);
      window.alert("Try downloading again!");
    }
  };

  importFromJSON = (json: object | fabric.Object) => {
    this.canvas.loadFromJSON(json, () => {
      console.log("uploaded");
      this.canvas.renderAll();
    });
  };

  render() {
    return <canvas id="c" style={{ border: "2px solid black" }} />;
  }
}
