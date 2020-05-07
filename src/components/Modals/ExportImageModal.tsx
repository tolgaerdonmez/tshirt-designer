import React, { ReactElement, useState, ChangeEvent } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { saveAs } from "file-saver";

interface Props {
	canvas: HTMLCanvasElement;
}

function ExportImageModal({ canvas }: Props): ReactElement {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		var isFileSaverSupported = !!new Blob();
	} catch (error) {
		console.log(error);
	}
	const [show, setShow] = useState(false);
	const [selected, setSelected] = useState("jpg");

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSelected(e.target.name);
	};

	const handleDownload = () => {
		try {
			canvas.toBlob((data: any) => {
				saveAs(data, "tshirt." + selected);
				handleClose();
			});
		} catch (e) {
			console.log(e);
			window.alert("Try downloading again!");
		}
	};

	return (
		<>
			<Button variant="primary" onClick={handleShow}>
				<i className="fas fa-image mr-1"></i>
				Export Image
			</Button>

			<Modal show={show} onHide={handleClose}>
				<Modal.Body>
					<Form>
						<Form.Label>Export as: </Form.Label>
						<div key="inline-radio" className="mb-3">
							<Form.Check
								inline
								type="radio"
								label="jpg"
								name="jpg"
								checked={selected === "jpg" ? true : false}
								onChange={handleOnChange}
							/>
							<Form.Check
								inline
								type="radio"
								label="png"
								name="png"
								checked={selected === "png" ? true : false}
								onChange={handleOnChange}
							/>
						</div>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Cancel
					</Button>
					<Button variant="primary" onClick={handleDownload}>
						Download
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
export default ExportImageModal;
