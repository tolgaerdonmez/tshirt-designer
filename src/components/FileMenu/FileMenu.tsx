import React, {useState} from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import ExportAsImageModal from './Modals/ExportAsImageModal';
import ExportProjectModal from './Modals/ExportProjectModal';
import ImportProjectModal from './Modals/ImportProjectModal';

import {State} from '../../data_type/interfaces';

interface Props {
    style?: Object;
    editor: State;
    setEditor:(properties:object, callback?:()=>void)=>void;
}

const FileMenu:React.FC<Props> = ({editor, setEditor, style={}}) => {

    const [showExportAsImage, setShowExportAsImage] = useState(false);
    const [showExportProject, setShowExportProject] = useState(false);
    const [showImportProject, setShowImportProject] = useState(false);
    const handlePreview = ()=>{
        const {previewing} = editor;
        setEditor({previewing: !previewing});
    };
  return (
    <>
        <DropdownButton variant="secondary" title="File" id="bg-nested-dropdown" style={style}>
            <Dropdown.Divider />
            <Dropdown.Item 
                eventKey="1" 
                onSelect={(eventKey:string, event:any) => {
                        setShowImportProject(true)
                    }}>Import Project
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item 
                eventKey="2" 
                onSelect={(eventKey:string, event:any) => {
                        setShowExportAsImage(true)
                    }}>
                    Export As Image
            </Dropdown.Item>
            <Dropdown.Item 
                eventKey="3" 
                onSelect={(eventKey:string, event:any) => {
                        setShowExportProject(true)
                    }}>Export Project
            </Dropdown.Item>

            <Dropdown.Divider />
            <Dropdown.Item 
                eventKey="4" 
                onSelect={handlePreview}>Preview
            </Dropdown.Item>
        </DropdownButton>
        <ExportAsImageModal 
            show={showExportAsImage} 
            setShow={(visible:boolean) => { 
                setShowExportAsImage(visible);
            }}
            exportFunction={editor.canvasController.exportToImage} 
        />
        <ExportProjectModal 
            show={showExportProject} 
            setShow={(visible:boolean) => { 
                setShowExportProject(visible);
            }}
            exportFunction={editor.canvasController.exportToJSON} 
        />
        <ImportProjectModal 
            show={showImportProject} 
            setShow={(visible:boolean) => { 
                setShowImportProject(visible);
            }}
            importFunction={editor.canvasController.importFromJSON} 
        />
    </>
  );
}

export default FileMenu;
