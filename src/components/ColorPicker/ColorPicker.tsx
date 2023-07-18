import React, { ReactElement, useState, useEffect, ChangeEvent } from "react";
import { Form } from "react-bootstrap";
import "./ColorPicker.css";

interface Props {
	getColor: (color: string) => void; // it is named get color, because the parent components use to get color
	defaultColor: string;
}

const to255 = (x: number) => (x * 255) / 100;
const to100 = (x: number) => (x * 100) / 255;

function ColorPicker({ getColor, defaultColor }: Props): ReactElement {
	const [color, setColor]: [any, (color: any) => void] = useState({ R: 100, G: 100, B: 100, A: 100 });

	useEffect(() => {
		let _t = defaultColor.split(",");
		_t[0] = _t[0].slice(5);
		_t[_t.length - 1] = _t[_t.length - 1].slice(0, _t.length - 1);
		const _c = {
			R: to100(Number(_t[0])),
			G: to100(Number(_t[1])),
			B: to100(Number(_t[2])),
			A: to100(Number(_t[3])),
		};
		setColor(_c);
	}, [defaultColor]);

	const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
		let _color: any = { ...color };
		let _c: number = Number(e.target.value);
		if (isNaN(_c)) _c = 100;
		if (e.target.type === "text") _c = to100(_c);
		_color[e.target.name] = _c;
		setColor(_color);
		getColor(`rgba(${to255(color.R)},${to255(color.G)},${to255(color.B)},${to255(color.A)})`);
	};

	return (
		<div className="d-flex flex-row align-items-center">
			<Form>
				<Form.Group controlId="color-slider">
					<div className="d-flex flex-column align-items-center">
						<Form.Label>Select Color</Form.Label>
						<div
							id="color-showcase"
							style={{
								borderWidth: color.R < 100 || color.G < 100 || color.B < 100 ? 0 : "2px",
								backgroundColor: `rgba(${to255(color.R)},${to255(color.G)},${to255(color.B)},${to255(
									color.A
								)})`,
							}}
						/>
					</div>
					{["R", "G", "B", "A"].map((c: string) => (
						<div key={c} className="d-flex flex-row align-items-center">
							<Form.Label className="mx-2">{c}</Form.Label>
							<Form.Control
								custom
								type="range"
								name={c}
								onChange={handleOnChange}
								value={color[c]}
								className="mx-2"
							/>
							<Form.Control
								type="text"
								name={c}
								onChange={handleOnChange}
								value={Math.floor(to255(color[c]))}
								style={{ width: "3vw" }}
							/>
						</div>
					))}
				</Form.Group>
			</Form>
		</div>
	);
}

export default ColorPicker;
