import React from 'react';
import {thumbnailLocation} from '../../thumbnail';

interface Props {
  templateName: string;
  templateDescription: string;
  buttons: string[];
  buttonActions: any;
}

export default function ProgramPreview(props: Props): JSX.Element {
  const {templateName, templateDescription, buttons, buttonActions} = props;
  const buttonResponses = buttonActions(templateName);
  return (
    <div className="program-option flex">
      <div className="program-option-img-container">
        <img src={thumbnailLocation(templateName)} />
      </div>
      <div className="flex-down">
        <h3>{templateName}</h3>
        {templateDescription && <h5>{`${templateDescription}`}</h5>}
        <div className="flex">
          {buttons.map((button: string) => {
            return (
              <button onClick={buttonResponses[button.toLowerCase()]} key={`${templateName}-${button}`}>
                {button}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
