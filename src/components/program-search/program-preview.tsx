import React from 'react';
import {thumbnailLocation} from '../../thumbnail';

interface Props {
  templateName: string;
  templateDescription: string;
  buttons: {name: string; onClick: any}[];
}

export default function ProgramPreview(props: Props): JSX.Element {
  const {templateName, templateDescription, buttons} = props;
  return (
    <div className="program-option flex">
      <div className="program-option-img-container">
        <img src={thumbnailLocation(templateName)} />
      </div>
      <div className="flex-down">
        <h3>{templateName}</h3>
        {templateDescription && <h5>{`${templateDescription}`}</h5>}
        <div className="flex">
          {buttons.map(button => (
            <button onClick={button.onClick} key={`${templateName}-${button.name}`}>
              {button.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
