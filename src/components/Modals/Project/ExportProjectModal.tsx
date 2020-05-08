import React, { ReactElement, useState, ChangeEvent, FormEvent } from "react";
import { Button, Modal, Form } from "react-bootstrap";

interface Props {
	exportFunction: (fileName: string) => void;
}

function ExportProjectModal({ exportFunction }: Props): ReactElement {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		var isFileSaverSupported = !!new Blob();
	} catch (error) {
		console.log(error);
	}
	const [show, setShow] = useState(false);
	const [fileName, setFileName] = useState("");

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		setFileName(e.target.value);
	};

	const handleDownload = (e: FormEvent) => {
		e.preventDefault();
		exportFunction(fileName);
		handleClose();
	};

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				Export Design Project File
			</Button>

			<Modal show={show} onHide={handleClose}>
				<Form onSubmit={handleDownload}>
					<Modal.Body>
						<Form.Label>Project Name: </Form.Label>
						<Form.Control required type="text" onChange={handleOnChange} value={fileName} />
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" variant="primary">
							Download
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</>
	);
}
export default ExportProjectModal;
