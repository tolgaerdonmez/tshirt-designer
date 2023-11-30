import React from 'react';
import "../../bootstrap.min.css";
import "./TextLoader.css";

interface Props {
  className?: string;
}

const TextLoader: React.FC<Props> = ({className=""}) => {
  return (
    // <div className="text-loader off">
    //   <div className="spinner" />
    // </div>
    <div className="d-flex justify-content-center spinner-container">
        <div className={`spinner-border text-primary ${className}`} role="status">
            <span className="sr-only">Loading...</span>
        </div>
    </div>
  );
};

export default TextLoader;
