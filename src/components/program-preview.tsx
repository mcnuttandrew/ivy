import React, {useState} from 'react';
import {GenericAction} from '../actions/index';
import Thumbnail from './thumbnail';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog, TiInfoLarge} from 'react-icons/ti';
import DataSymbol from './data-symbol';
import {DataType} from '../templates/types';

type TypeCounts = {[x: string]: number};
interface Props {
  alreadyPresent?: boolean;
  buttons: {name: string; onClick: any}[];
  isComplete?: boolean;
  preventUse?: boolean;
  setEncodingMode?: GenericAction<string>;
  templateAuthor: string;
  templateDescription: string;
  templateName: string;
  typeCounts?: TypeCounts;
}

function partialMatch(): JSX.Element {
  return (
    <Tooltip
      placement="right"
      trigger="click"
      overlay={
        <div className="tooltip-internal">
          The search you have supplied on the left partially matches this template. It does not conflict, but
          if you will need to supply extra fields to get a visualization.
        </div>
      }
    >
      <span className="tooltip-icon">
        <TiInfoLarge />
      </span>
    </Tooltip>
  );
}

function fullMatch(): JSX.Element {
  return (
    <Tooltip
      placement="right"
      trigger="click"
      overlay={
        <div className="tooltip-internal">
          This template is a complete match, i.e. the query you have supplied to the left will completely fill
          out this template
        </div>
      }
    >
      <span className="tooltip-icon">
        <TiInfoLarge />
      </span>
    </Tooltip>
  );
}

interface CardControlsProps {
  buttons: {name: string; onClick: any}[];
  templateName: string;
  templateAuthor?: string;
}

function CardControls(props: CardControlsProps): JSX.Element {
  const {buttons, templateName, templateAuthor} = props;
  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="flex">
          {templateAuthor && <span>{`By: ${templateAuthor}`}</span>}
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
  );
}

function RenderTypeCounts(typeCounts: TypeCounts): JSX.Element {
  const messages = ['DIMENSION', 'MEASURE', 'TIME']
    .filter(d => typeCounts[d] > 0)
    .map((key: string) => {
      return (
        <div
          key={key}
          className={classnames({
            flex: true,
            'program-option-type-pill': true,
            [`program-option-type-pill--${key.toLowerCase()}`]: true,
          })}
        >
          <span>{typeCounts[key]}</span>
          <span className="program-option-type-symbol">
            <DataSymbol type={key as DataType} />
          </span>
          <span>fields</span>
        </div>
      );
    });
  return (
    <div className="flex-down">
      <div>{messages.length ? 'Requires at least' : 'Requires no fields to get started'}</div>
      <div className="flex flex-wrap">{messages}</div>
    </div>
  );
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
  const [showDescription, setDescriptionShow] = useState(false);
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
            <Thumbnail templateName={templateName} templateAuthor={templateAuthor} />
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
            </div>
            {CardControls({buttons, templateName, templateAuthor})}
          </div>

          {alreadyPresent && (
            <div className="program-option-search-match">A template by this name is already loaded</div>
          )}
          {typeCounts && RenderTypeCounts(typeCounts)}
        </div>
      </div>
      <div className="flex-down">
        <div className="flex space-between">
          <div className="program-option-search-match flex">
            <span>{isComplete ? 'Full Match' : 'Partial Match'} </span>
            {isComplete && fullMatch()}
            {!isComplete && partialMatch()}
          </div>
          <div
            className="program-option-search--description-toggle"
            onClick={(): void => setDescriptionShow(!showDescription)}
          >{`About ${showDescription ? '-' : '+'}`}</div>
        </div>
        {showDescription && templateDescription && <p>{`${templateDescription}`}</p>}
      </div>
    </div>
  );
}
