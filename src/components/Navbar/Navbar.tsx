import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import FileMenu from "./FileMenu/FileMenu";
import {State} from "../../data_type/interfaces";
interface Props { 
  editor: State;
  setEditor:(properties:object, callback?:()=>void)=>void;
}

const NavbarComp:React.FC<Props> = ({editor, setEditor}) => {

  //const callbackRef = useRef<() => void>(() => {});
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand>Custom T-Shirt Design</Navbar.Brand>
      <Nav className="mr-auto"><FileMenu editor={editor} setEditor={setEditor} /></Nav>
    </Navbar>
  );
}

export default NavbarComp;
