import React, { Component, ChangeEvent } from "react";
import { Col, Row, Button, InputGroup, FormControl } from "react-bootstrap";
import Canvas, { CanvasController } from "./Canvas";
import { fabric } from "fabric";
import FontPicker from "../CustomFontPicker";
import "./Editor.css";

import { google_access_key } from "../../config.json";

interface Props {}
interface State {
	canvasController: CanvasController;
	editorReady: boolean;
	textInput: string;
	textFont: string;
	selectedObjects: fabric.Object[];
	[key: string]: any;
}

class Editor extends Component<Props, State> {
	state = {
		canvasController: {} as CanvasController,
		editorReady: false,
		textInput: "",
		textFont: "Open Sans",
		selectedObjects: [] as fabric.Object[],
	};

	componentDidMount() {
		// this.setState({ canvas });
	}

	handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	initCanvasController = (controller: CanvasController) => {
		controller.canvas.on("mouse:down", () => {
			const selected = controller.canvas.getActiveObjects();
			if (selected.length > 0) this.setState({ selectedObjects: selected });
			else this.setState({ selectedObjects: [] });
		});
		controller.canvas.on("mouse:up", () => {
			const selected = controller.canvas.getActiveObjects();
			if (selected.length > 0) this.setState({ selectedObjects: selected });
		});
		this.setState({ canvasController: controller, editorReady: true });
	};

	render() {
		const { canvasController } = this.state;
		return (
			<div className="my-5 mx-5">
				<Row>
					<Col>
						<Canvas tshirt="tshirt" controller={controller => this.initCanvasController(controller)} />
						{/* Object options */}
						<div className="mt-3">
							<Button
								variant="danger"
								disabled={this.state.selectedObjects.length === 0}
								onClick={() => {
									canvasController.deleteObjects(this.state.selectedObjects);
									this.setState({ selectedObjects: [] as fabric.Object[] });
								}}>
								<i className="fas fa-trash mr-1"></i>
								Delete Selected
							</Button>
						</div>
					</Col>
					<Col>
						<Row>
							<h1>Editor</h1>
						</Row>
						{/* Editor Panel */}
						{this.state.editorReady ? (
							<>
								<Row>
									<Button onClick={canvasController.addImage}>
										<i className="fas fa-image mr-1"></i>
										Add Image
									</Button>
								</Row>
								<Row className="mt-2">
									<InputGroup className="my-3">
										<FontPicker
											apiKey={google_access_key}
											activeFontFamily={this.state.textFont}
											onChange={nextFont => {
												this.setState({
													textFont: nextFont.family,
												});
											}}
											setActiveFontCallback={() => {
												// console.log("loaded");
												this.state.canvasController.canvas.renderAll();
											}}
										/>
										<FormControl
											placeholder="New Text"
											aria-label="text"
											name="textInput"
											onChange={this.handleOnChange}
											value={this.state.textInput}
											type="text"
										/>
										<InputGroup.Prepend>
											<Button
												onClick={() => {
													canvasController.addText(this.state.textInput, this.state.textFont);
													this.setState({ textInput: "" });
												}}>
												<i className="fas fa-plus mr-1"></i>
												Add Text
											</Button>
										</InputGroup.Prepend>
									</InputGroup>
								</Row>
							</>
						) : null}
					</Col>
				</Row>
			</div>
		);
	}
}

export default Editor;
