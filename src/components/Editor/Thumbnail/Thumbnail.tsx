import React from "react";
import { Image, Card } from "react-bootstrap";

interface Props { 
  handleSelection:(e:any)=>void;
  imageUrl: string;
}

const Thumbnail:React.FC<Props> = ({imageUrl, handleSelection}) => {
  return (
    <Card style={{ width: "4rem" }} onClick={handleSelection}>
      <Image src={imageUrl} thumbnail />
    </Card>
  );
}

export default Thumbnail;
