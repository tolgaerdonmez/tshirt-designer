import React, { ReactElement, useState, ChangeEvent } from "react";
import { Button, Modal, FormFile } from "react-bootstrap";
import { fabric } from "fabric";

interface Props {
	importFunction: (json: object | fabric.Object) => void;
}

function ImportProjectModal({ importFunction }: Props): ReactElement {
	const [show, setShow] = useState(false);
	const [canvasJSON, setCanvasJSON] = useState({} as object | fabric.Object);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const handleFileOnChange = (e: ChangeEvent<HTMLInputElement> | any) => {
		const file: File = e.target.files[0];
		let reader = new FileReader();

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
	};

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Import Design Project File
			</Button>

			<Modal show={show} onHide={handleClose}>
				<Modal.Body>
					<div className="py-2 px-2">
						<FormFile>
							<FormFile.Label>Upload your project file (*.tdp)</FormFile.Label>
							<FormFile.Input accept=".tdp, .json" onChange={handleFileOnChange} />
						</FormFile>
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
