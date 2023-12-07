// import React, { useState } from 'react'; // Import the styles for the editor

// const NavbarComp = () => {
//   // State for managing the content of the editor
//   const [editorContent, setEditorContent] = useState('');

//   // Event handler for updating the editor content
//   const handleEditorChange = (content:any) => {
//     setEditorContent(content);
//   };

//   return (
//     <div>
//       <h2>Rich Text Editor</h2>
//       <div>
//         <strong>Editor Content:</strong>
//         <div dangerouslySetInnerHTML={{ __html: editorContent }} />
//       </div>
//     </div>
//   );
// };

// export default NavbarComp;


import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import FileMenu from "./FileMenu/FileMenu";
import State from "../interfaces/State";

interface Props { 
  editor: State;
}

const NavbarComp:React.FC<Props> = ({editor}) => {
  //  const customStyles:Object = {
  //   display: 'inline-block',
  //   marginLeft: '30px'
  // };
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand>Custom T-Shirt Design</Navbar.Brand>
      <Nav className="mr-auto"><FileMenu editor={editor} /></Nav>
      
    </Navbar>
  );
}

export default NavbarComp;
