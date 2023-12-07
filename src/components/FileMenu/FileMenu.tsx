import React, {useState} from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import ExportAsImageModal from '../SideMenu/Modals/ExportAsImageModal';
import State from '../../interfaces/State';
// import ExportImageModal from "../Modals/Image/ExportImageModal";
// import ImportProjectModal from "../Modals/Project/ImportProjectModal";
// import ExportProjectModal from "../Modals/Project/ExportProjectModal";

interface Props {
    style?: Object;
    editor: State;
}

const FileMenu:React.FC<Props> = ({editor, style={}}) => {
    const [showExportAsImage, setShowExportAsImage] = useState(false);
  return (
    // <ExportImageModal
    //     exportFunction={this.state.canvasController.exportToImage}
    //   />
    //   <ButtonGroup className="ml-2">
    //     <ExportProjectModal
    //       exportFunction={this.state.canvasController.exportToJSON}
    //     />
    //     <ImportProjectModal
    //       importFunction={
    //         this.state.canvasController.importFromJSON
    //       }
    //     />
    //   </ButtonGroup>

    //   <Button variant="primary" onClick={handleShow}>
    //     <i className="fas fa-image mr-1"></i>
    //     Download Design
    //   </Button>
    <>
        <DropdownButton variant="secondary" title="File" id="bg-nested-dropdown" style={style}>
            <Dropdown.Item 
                eventKey="1" 
                onSelect={(eventKey:string, event:any) => {
                        setShowExportAsImage(true)
                    }}>
                    Export As Image
            </Dropdown.Item>
            <Dropdown.Item eventKey="2">Export Project</Dropdown.Item>
            <Dropdown.Item eventKey="3">Import Project</Dropdown.Item>
        </DropdownButton>
        <ExportAsImageModal 
            show={showExportAsImage} 
            setShow={()=>{setShowExportAsImage(true)}} 
            exportFunction={editor.canvasController!.exportToImage} 
        />
    </>
  );
}

export default FileMenu;
