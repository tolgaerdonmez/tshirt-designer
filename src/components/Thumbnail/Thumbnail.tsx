import React from "react";
import { Image, Card } from "react-bootstrap";

function Thumbnail(props: any) {
  return (
    <Card style={{ width: "6rem" }} onClick={props.handleSelection}>
      <Image src={props.imageUrl} thumbnail />
    </Card>
  );
}

export default Thumbnail;
