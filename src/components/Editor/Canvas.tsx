import React, { Component } from "react";
import { fabric } from "fabric";

export interface CanvasController {
	canvas: fabric.Canvas;
	setBackground: () => void;
	addImage: () => void;
	addText: (text: string, fontFamily: string) => void;
	deleteObjects: (objects: fabric.Object[]) => void;
}

interface Props {
	tshirt: string;
	controller: (controller: CanvasController) => void;
}
interface State {}

export default class Canvas extends Component<Props, State> {
	state = {};
	canvas!: fabric.Canvas;

	componentDidMount() {
		//creating the canvas
		this.canvas = new fabric.Canvas("c", { renderOnAddRemove: true });

		this.props.controller({ ...(this as CanvasController) });
		// setting the background image
		this.setBackground();
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
	};

	render() {
		return <canvas id="c" style={{ border: "2px solid black" }} />;
	}
}
