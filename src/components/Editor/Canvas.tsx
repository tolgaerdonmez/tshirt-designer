import React, { Component } from "react";
import { fabric } from "fabric";
import { saveAs } from "file-saver";

export interface CanvasController {
  canvas: fabric.Canvas;
  setBackground: (tShirtId: string) => void;
  setTShirt: (tShirtId: string) => void;
  addImage: () => void;
  addText: (text: string, fontFamily: string, textColor: string) => void;
  updateText: (
    textObj: fabric.Textbox,
    text: string,
    fontFamily: string,
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

export default class Canvas extends Component<Props, State> {
  canvas!: fabric.Canvas;

  componentDidMount() {
    //creating the canvas
    this.canvas = new fabric.Canvas("c", { renderOnAddRemove: true });

    if (this.props.controller !== undefined)
      this.props.controller({ ...(this as CanvasController) });
    // setting the background image
    if (this.props.tshirt !== undefined)
      this.setBackground(this.props.tShirtId);
  }

  setBackground = (tShirtId: string) => {
    fabric.Image.fromURL(this.getPathById(tShirtId), (img) => {
      console.log("set background tshirt id: ", this.getPathById(tShirtId));
      img.center();
      const h: number = img.getScaledHeight();
      const w: number = img.getScaledWidth();
      this.canvas.setHeight(h);
      this.canvas.setWidth(w);
      this.canvas.setBackgroundImage(img, () => {});
    });
  };
  /*********************************/
  setTShirt = (tShirtId: string) => {
    let objects = this.canvas.getObjects();
    //this.deleteObjects(objects);
    this.setBackground(tShirtId);
  };
  /*********************************/
  addImage = () => {
    console.log("adding image");
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
    this.canvas.add(t);
  };

  updateText = (
    textObj: fabric.Textbox,
    text: string,
    fontFamily: string,
    textColor: string
  ) => {
    console.log("Update Text, textColor: ", textColor);
    textObj.set({ text, fontFamily, fill: textColor });
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
