import React from 'react';
import { Figure } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./ClickableIcon.css";

interface Props {
    fontAwesomeIcon: any;
    text: string;
    onClick?: ()=>void;
}

const ClickableIcon: React.FC<Props> = ({fontAwesomeIcon, text, onClick=void 0 }) => {

  return (
    <div className="clickable-icon-container">
      <button onClick={onClick} className="clickable-icon">
        <Figure>
          <FontAwesomeIcon icon={fontAwesomeIcon} />
          <Figure.Caption>
            {text}
          </Figure.Caption>
        </Figure>
      </button>
    </div>
  );
};

export default ClickableIcon;
