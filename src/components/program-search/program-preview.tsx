import React from 'react';
import {GenericAction} from '../../actions/index';
import {thumbnailLocation} from '../../thumbnail';
import {classnames} from '../../utils';
import Tooltip from 'rc-tooltip';
import {TiCog} from 'react-icons/ti';
import DataSymbol from '../data-symbol';
import {DataType} from '../../types';

interface Props {
  alreadyPresent?: boolean;
  buttons: {name: string; onClick: any}[];
  isComplete?: boolean;
  preventUse?: boolean;
  setEncodingMode?: GenericAction<string>;
  templateAuthor: string;
  templateDescription: string;
  templateName: string;
  typeCounts?: {[x: string]: string};
}

export default function ProgramPreview(props: Props): JSX.Element {
  const {
    alreadyPresent,
    buttons,
    isComplete,
    setEncodingMode,
    templateDescription,
    templateName,
    typeCounts,
    preventUse,
  } = props;
  return (
    <div
      className={classnames({
        'program-option': true,
        'flex-down': true,
      })}
    >
      <div className="flex">
        <div className="program-option-img-container">
          <img src={thumbnailLocation(templateName)} />
        </div>
        <div className="flex-down">
          <div className="program-option-title">
            <h3>{templateName}</h3>
            <Tooltip
              placement="bottom"
              trigger="click"
              overlay={
                <div className="flex">
                  {buttons.map(button => (
                    <button onClick={button.onClick} key={`${templateName}-${button.name}`}>
                      {button.name}
                    </button>
                  ))}
                </div>
              }
            >
              <div className="program-option-settings">
                <TiCog />
              </div>
            </Tooltip>
          </div>
          {isComplete && <div className="program-option-search-match">Search is a Full Match!</div>}
          {alreadyPresent && (
            <div className="program-option-search-match">A template by this name is already loaded</div>
          )}
          {typeCounts && (
            <div className="flex">
              {['DIMENSION', 'MEASURE', 'TIME', 'SUM'].map((key: string) => {
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
          {!preventUse && (
            <button className="use-button" onClick={(): any => setEncodingMode(templateName)}>
              USE
            </button>
          )}
          {/* {templateAuthor && <h5>{`By: ${templateAuthor}`}</h5>} */}
        </div>
      </div>
      {templateDescription && <h5>{`${templateDescription}`}</h5>}
    </div>
  );
}
