import React, { useState } from "react";
import { FormControl, Dropdown } from "react-bootstrap";
import FontPicker from "./font-picker-react/dist/FontPicker";
// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
	(
		{
			children,
			style,
			className,
			"aria-labelledby": labeledBy,
		}: { children: any; style?: object; className?: string; "aria-labelledby"?: string },
		ref: any
	) => {
		const [value, setValue] = useState("");

		return (
			<div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
				<FormControl
					autoFocus
					className="mx-3 my-2 w-auto"
					placeholder="Type to filter..."
					onChange={e => setValue(e.target.value)}
					value={value}
				/>
				<ul className="list-unstyled">
					{React.Children.toArray(children).filter(
						(child: any) => !value || child.props.children.toLowerCase().startsWith(value)
					)}
				</ul>
			</div>
		);
	}
);

FontPicker.prototype.onFontSelect = function (font) {
	// var target = e.target;
	const activeFontFamily: string = font;
	if (!activeFontFamily) {
		throw Error("Missing font family in clicked font button");
	}
	this.setActiveFontFamily(activeFontFamily);
};

FontPicker.prototype.render = function () {
	var _a = this.props,
		activeFontFamily = _a.activeFontFamily,
		sort = _a.sort;
	var _b = this.state,
		// expanded = _b.expanded,
		loadingStatus = _b.loadingStatus;
	var fonts = Array.from(this.fontManager.getFonts().values());
	if (sort === "alphabet") {
		fonts.sort(function (font1, font2) {
			return font1.family.localeCompare(font2.family);
		});
	}
	const fontList = this.generateFontList(fonts);
	console.log ("font list", fontList);
	return (
		<Dropdown>
			<Dropdown.Toggle variant="success" id="dropdown-basic">
				{activeFontFamily}
			</Dropdown.Toggle>

			<Dropdown.Menu as={CustomMenu}>
				{loadingStatus === "finished" && fonts
					? fonts.map(font => (
							<Dropdown.Item key={font.id} onClick={() => this.onFontSelect(font.family)}>
								{font.family}
							</Dropdown.Item>
					  ))
					: null}
				{/* <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
				 <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
				 <Dropdown.Item href="#/action-3">Something else</Dropdown.Item> */}
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default FontPicker;
