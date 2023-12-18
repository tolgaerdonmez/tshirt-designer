import React, { ReactElement, useState, ChangeEvent } from "react";
import { Button, Modal, Form } from "react-bootstrap";

interface Props {
  show: boolean;
  setShow: (visible:boolean)=>void;
  exportFunction: (
    format: string,
    fileName?: string,
    includeBackground?: boolean,
  ) => void;
}

function ExportAsImageModal({ exportFunction, show, setShow }: Props): ReactElement {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var isFileSaverSupported = !!new Blob();
  } catch (error) {
    console.log(error);
  }
  // const [show, setShow] = useState(false);
  const [selected, setSelected] = useState("jpg");
  const [includeBackground, setIncludeBackground] = useState(true);

  const handleClose = () => setShow(false);
  //const handleShow = () => setShow(true);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.name);
  };

  const handleDownload = () => {
    exportFunction(selected, "tshirt", includeBackground);
    handleClose();
  };

  return (
    <>
      {/* <Button variant="primary" onClick={handleShow}>
        <i className="fas fa-image mr-1"></i>
        Download Design
      </Button> */}

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
                checked={selected === "jpg"}
                onChange={handleOnChange}
              />
              <Form.Check
                inline
                type="radio"
                label="png"
                name="png"
                checked={selected === "png"}
                onChange={handleOnChange}
              />
              <Form.Check
                inline
                type="checkbox"
                label="Include Background"
                name="includeBackground"
                checked={includeBackground}
                onChange={() => {
                  setIncludeBackground(!includeBackground);
                }}
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
export default ExportAsImageModal;
