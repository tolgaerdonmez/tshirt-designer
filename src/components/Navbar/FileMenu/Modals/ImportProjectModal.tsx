import React, { ReactElement, useState, ChangeEvent } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { fabric } from "fabric";

interface Props {
	show: boolean;
  	setShow: (visible:boolean)=>void;	
	importFunction: (json: object | fabric.Object) => void;
}

function ImportProjectModal({ show, setShow, importFunction }: Props): ReactElement {
	// const [show, setShow] = useState(false);
	const [canvasJSON, setCanvasJSON] = useState({} as object | fabric.Object);
	const [fileName, setFileName] = useState("file");
	const handleClose = () => setShow(false);
	const handleFileOnChange = (e: ChangeEvent<HTMLInputElement> | any) => {
		const file: File = e.target.files[0];
		let reader = new FileReader();
		setFileName(file.name);
		reader.onload = () => {
			if (typeof reader.result === "string") {
				const res: string = reader.result;
				const data: object | fabric.Object = JSON.parse(res);
				setCanvasJSON(data);
			}
		};

		reader.readAsText(file);
	};

	const handleImport = () => {
		importFunction(canvasJSON);
		handleClose();
	};

	return (
		<>
			<Modal show={show} onHide={handleClose}>
				<Modal.Body>
					<div className="py-2 px-2">
						<Form.File>
							<Form.Label>Upload your project file (*.tdp)</Form.Label>
							<Form.File custom label={fileName} accept=".tdp, .json" onChange={handleFileOnChange} />
						</Form.File>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Cancel
					</Button>
					<Button variant="primary" onClick={handleImport}>
						Import project
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
export default ImportProjectModal;
