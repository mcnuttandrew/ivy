import React, {useState} from 'react';
import {GenericAction} from '../actions/index';
import {thumbnailLocation} from '../utils/thumbnail';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog} from 'react-icons/ti';
import DataSymbol from './data-symbol';
import {DataType} from '../types';

interface Props {
  alreadyPresent?: boolean;
  buttons: {name: string; onClick: any}[];
  isComplete?: boolean;
  preventUse?: boolean;
  setEncodingMode?: GenericAction<string>;
  templateAuthor: string;
  templateDescription: string;
  templateName: string;
  typeCounts?: {complete: {[x: string]: string}; required: {[x: string]: string}};
}

export default function ProgramPreview(props: Props): JSX.Element {
  const {
    alreadyPresent,
    buttons,
    isComplete,
    setEncodingMode,
    templateDescription,
    templateName,
    templateAuthor,
    typeCounts,
    preventUse,
  } = props;

  const [showCompleteCount, setCountType] = useState(true);
  return (
    <div
      className={classnames({
        'program-option': true,
        'flex-down': true,
      })}
    >
      <div className="flex">
        <div className="flex-down program-option-use-template-container">
          <div className="program-option-img-container" onClick={(): any => setEncodingMode(templateName)}>
            <img src={thumbnailLocation(templateName)} />
          </div>
          {!preventUse && (
            <button className="use-button" onClick={(): any => setEncodingMode(templateName)}>
              USE
            </button>
          )}
        </div>
        <div className="flex-down full-width">
          <div className="program-option-title">
            <div className="flex-down">
              <h3>{templateName}</h3>
              {templateAuthor && <span>{`By: ${templateAuthor}`}</span>}
            </div>
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

          <div className="program-option-search-match">
            {isComplete && (
              <Tooltip
                placement="top"
                trigger="hover"
                overlay={
                  <div className="tooltip-internal">
                    This template is a complete match, i.e. the query you have supplied to the left will
                    completely fill out this template
                  </div>
                }
              >
                <span>Search is a Full Match!</span>
              </Tooltip>
            )}
            {!isComplete && (
              <Tooltip
                placement="top"
                trigger="hover"
                overlay={
                  <div className="tooltip-internal">
                    The search you have supplied on the left partially matches this template. It does not
                    conflict, but if you will need to supply extra fields to get a visualization.
                  </div>
                }
              >
                <span>Partial Match</span>
              </Tooltip>
            )}
          </div>

          {alreadyPresent && (
            <div className="program-option-search-match">A template by this name is already loaded</div>
          )}
          {typeCounts && (
            <div className="flex-down">
              <div className="flex">
                {['DIMENSION', 'MEASURE', 'TIME', 'SUM'].map((key: string) => {
                  return (
                    <Tooltip
                      key={key}
                      placement="bottom"
                      trigger="click"
                      overlay={
                        <div className="tooltip-internal">
                          {`The number of ${key} required to fill out the chart`}
                        </div>
                      }
                    >
                      <div
                        className={classnames({
                          flex: true,
                          'program-option-type-pill': true,
                          [`program-option-type-pill--${key.toLowerCase()}`]: true,
                        })}
                      >
                        <div className="program-option-type-symbol">
                          <DataSymbol type={key as DataType} />
                        </div>
                        <div>{typeCounts[showCompleteCount ? 'complete' : 'required'][key]}</div>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
              <div className="flex">
                {['Complete', 'Required'].map(d => (
                  <div
                    className={classnames({
                      'program-option-search-type-control': true,
                      'program-option-search-type-control--selected':
                        (showCompleteCount && d === 'Complete') || (!showCompleteCount && d === 'Required'),
                    })}
                    key={d}
                    onClick={(): any => setCountType(d === 'Complete')}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {templateDescription && <p>{`${templateDescription}`}</p>}
    </div>
  );
}
