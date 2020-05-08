import React, { Component } from "react";
import { fabric } from "fabric";
import { saveAs } from "file-saver";

export interface CanvasController {
	canvas: fabric.Canvas;
	setBackground: () => void;
	addImage: () => void;
	addText: (text: string, fontFamily: string) => void;
	deleteObjects: (objects: fabric.Object[]) => void;
	changeObjectOrder: (object: fabric.Object[], direction: CanvasOrderDirection | string) => void;
	exportToImage: (format: string, fileName?: string, includeBackground?: boolean) => void;
	exportToJSON: (fileName: string) => void;
	importFromJSON: (json: object | fabric.Object) => void;
}

export enum CanvasOrderDirection {
	backwards = "backwards",
	forwards = "forwards",
	back = "back",
	front = "front",
}

interface Props {
	tshirt?: string;
	controller?: (controller: CanvasController) => void;
}
interface State {}

export default class Canvas extends Component<Props, State> {
	state = {};
	canvas!: fabric.Canvas;

	componentDidMount() {
		//creating the canvas
		this.canvas = new fabric.Canvas("c", { renderOnAddRemove: true });

		if (this.props.controller !== undefined) this.props.controller({ ...(this as CanvasController) });
		// setting the background image
		if (this.props.tshirt !== undefined) this.setBackground();
	}

	setBackground = () => {
		fabric.Image.fromURL(`images/${this.props.tshirt}.png`, img => {
			img.center();
			const h: number = img.getScaledHeight();
			const w: number = img.getScaledWidth();
			this.canvas.setHeight(h);
			this.canvas.setWidth(w);
			this.canvas.setBackgroundImage(img, () => {});
		});
	};

	addImage = () => {
		console.log("adding image");
		fabric.Image.fromURL("images/logo512.png", img => {
			this.canvas.add(img);
		});
	};

	addText = (text: string, fontFamily: string) => {
		const [w, h]: number[] = [this.canvas.getWidth(), this.canvas.getHeight()];
		let t = new fabric.Text(text, {
			left: w / 4,
			top: h / 4,
			fontFamily: fontFamily,
			fontSize: 100,
			fill: "white",
		});
		this.canvas.add(t);
	};

	deleteObjects = (objects: fabric.Object[]) => {
		objects.forEach(object => this.canvas.remove(object));
		this.canvas.discardActiveObject();
		this.canvas.renderAll();
	};

	changeObjectOrder = (objects: fabric.Object[], direction: CanvasOrderDirection | string) => {
		switch (direction) {
			case CanvasOrderDirection.backwards:
				objects.forEach(object => this.canvas.sendBackwards(object));
				break;
			case CanvasOrderDirection.forwards:
				objects.forEach(object => this.canvas.bringForward(object));
				break;
			case CanvasOrderDirection.back:
				objects.forEach(object => this.canvas.sendToBack(object));
				break;
			case CanvasOrderDirection.front:
				objects.forEach(object => this.canvas.bringToFront(object));
				break;
			default:
				break;
		}
		this.canvas.discardActiveObject();
		this.canvas.renderAll();
	};

	exportToImage = (format: string, fileName: string = "design", includeBackground?: boolean) => {
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
