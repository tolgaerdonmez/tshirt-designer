import React from 'react';
import "./SideMenu.css";
import ClickableIcon from './ClickableIcon';
import { faShirt, faFont, faFill } from '@fortawesome/free-solid-svg-icons';
import ImageUploadModal from './Modals/ImageUploadModal';

interface Props {
    canvas:fabric.Canvas;
}

//const TextEditingTool: React.FC<Props> = ({editorState, setEditorState, loadFont}) => {
const SideMenu: React.FC<Props> = ({canvas}) => {
  return (
    <>
        <div className="side-toolbar">
            {/* <h2>Sidebar</h2>
            <p>This is a fixed sidebar with a width of 125px.</p> */}
            <ClickableIcon fontAwesomeIcon={faShirt} text="T-Shirt" />
            <ImageUploadModal canvas={canvas} />
            {/* <ClickableIcon fontAwesomeIcon={faFileUpload} text="Upload" /> */}
            <ClickableIcon fontAwesomeIcon={faFont} text="Text" />
            <ClickableIcon fontAwesomeIcon={faFill} text="Color" />
            <hr />
        </div>
    </>
  );
};

export default SideMenu;
