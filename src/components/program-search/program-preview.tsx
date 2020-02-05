import React from 'react';
import {GenericAction} from '../../actions/index';
import {thumbnailLocation} from '../../thumbnail';
import {classnames} from '../../utils';
import DataSymbol from '../data-symbol';
import {DataType} from '../../types';

interface Props {
  templateName: string;
  templateDescription: string;
  templateAuthor: string;
  buttons?: {name: string; onClick: any}[];
  setEncodingMode?: GenericAction<string>;
  typeCounts?: {[x: string]: string};
}

export default function ProgramPreview(props: Props): JSX.Element {
  const {templateName, templateDescription, templateAuthor, buttons, setEncodingMode, typeCounts} = props;
  console.log('TODO TYPE COUNTS');
  return (
    <div
      className={classnames({
        'program-option': true,
        flex: true,
        'program-option-as-button': !buttons,
      })}
      onClick={(): void => {
        if (buttons) {
          return;
        }
        setEncodingMode(templateName);
      }}
    >
      <div className="program-option-img-container">
        <img src={thumbnailLocation(templateName)} />
      </div>
      <div className="flex-down">
        <h3>{templateName}</h3>
        {templateDescription && <h5>{`${templateDescription}`}</h5>}
        {templateAuthor && <h5>{`By: ${templateAuthor}`}</h5>}

        {buttons && (
          <div className="flex">
            {buttons.map(button => (
              <button onClick={button.onClick} key={`${templateName}-${button.name}`}>
                {button.name}
              </button>
            ))}
          </div>
        )}
        {typeCounts && (
          <div className="flex">
            {['DIMENSION', 'MEASURE', 'TIME'].map((key: string) => {
              return (
                <div key={key} className="flex">
                  <div className="program-option-type-symbol">
                    <DataSymbol type={key as DataType} />
                  </div>
                  <div>{typeCounts[key]}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
