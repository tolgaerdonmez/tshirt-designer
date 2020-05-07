import React, { ReactElement } from "react";
import { Navbar } from "react-bootstrap";

function NavbarComp(): ReactElement {
	return (
		<Navbar bg="dark" variant="dark">
			<Navbar.Brand>T-Shirt Design</Navbar.Brand>
		</Navbar>
	);
}

export default NavbarComp;
