import React from "react";
import { SketchPicker } from "react-color";

// interface Props {
//   color: any;
//   onChangeComplete: void;
// }

function ColorSelector(props: any) {
  return (
    <SketchPicker
      color={props.color}
      onChangeComplete={props.handleChangeComplete}
    />
  );
}

export default ColorSelector;
