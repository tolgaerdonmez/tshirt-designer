import React, { Component, ChangeEvent } from "react";
import { Col, Row, Button, InputGroup, FormControl, ButtonGroup } from "react-bootstrap";
import Canvas, { CanvasController, CanvasOrderDirection } from "./Canvas";
import FontPicker from "../CustomFontPicker";
import ImageUploadModal from "../Modals/Image/ImageUploadModal";
import ExportImageModal from "../Modals/Image/ExportImageModal";
import ImportProjectModal from "../Modals/Project/ImportProjectModal";
import ExportProjectModal from "../Modals/Project/ExportProjectModal";
import "./Editor.css";

import { fabric } from "fabric";
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
							<ButtonGroup aria-label="change object order" className="ml-2">
								{Object.keys(CanvasOrderDirection).map(direction => (
									<Button
										key={direction}
										variant="warning"
										disabled={this.state.selectedObjects.length === 0}
										onClick={() =>
											this.state.canvasController.changeObjectOrder(
												this.state.selectedObjects,
												direction
											)
										}>
										{direction}
									</Button>
								))}
							</ButtonGroup>
						</div>
					</Col>
					<Col className="d-flex flex-column">
						<Row className="align-self-start">
							<h1>Editor</h1>
						</Row>
						{/* Editor Panel */}
						{this.state.editorReady ? (
							<>
								<Row>
									<ImageUploadModal canvas={this.state.canvasController.canvas} />
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
								<Row>
									<ExportImageModal exportFunction={this.state.canvasController.exportToImage} />
									<ButtonGroup className="ml-2">
										<ExportProjectModal exportFunction={this.state.canvasController.exportToJSON} />
										<ImportProjectModal
											importFunction={this.state.canvasController.importFromJSON}
										/>
									</ButtonGroup>
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
