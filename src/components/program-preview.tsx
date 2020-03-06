import React from 'react';
import {GenericAction} from '../actions/index';
import Thumbnail from './thumbnail';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog, TiInfoLarge} from 'react-icons/ti';
import {HoverTooltip} from './tooltips';

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
  userName: string;
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
  userName: string;
}

function CardControls(props: CardControlsProps): JSX.Element {
  const {buttons, templateName, templateAuthor, userName} = props;
  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="flex-down">
          <span>{`By: ${templateAuthor || 'UNKNOWN'} ${
            templateAuthor === userName ? '(Thats you!)' : ''
          }`}</span>
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
        <HoverTooltip message={`The minimum number of required ${key} columns to render`} key={key}>
          <div
            className={classnames({
              flex: true,
              'program-option-type-pill': true,
              [`program-option-type-pill--${key.toLowerCase()}`]: true,
            })}
          >
            <span>{typeCounts[key]}</span>
          </div>
        </HoverTooltip>
      );
    });
  return (
    <div className="flex">
      <div>{messages.length ? 'Requires' : 'No Fields Required'}</div>
      <div className="flex flex-wrap">{messages}</div>
    </div>
  );
}

export default function ProgramPreview(props: Props): JSX.Element {
  const {
    alreadyPresent,
    buttons,
    isComplete,
    preventUse,
    setEncodingMode,
    templateAuthor,
    templateDescription,
    templateName,
    typeCounts,
    userName,
  } = props;
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
            <button type="button" className="use-button" onClick={(): any => setEncodingMode(templateName)}>
              USE
            </button>
          )}
        </div>
        <div className="flex-down full-width">
          <div className="program-option-title">
            <h3
              className="program-option-title-label cursor-pointer"
              onClick={(): any => setEncodingMode(templateName)}
            >
              {templateName}
            </h3>
            {CardControls({buttons, templateName, templateAuthor, userName})}
          </div>
          <div className="flex-down">
            <div
              className="program-option-description cursor-pointer"
              onClick={(): any => setEncodingMode(templateName)}
            >
              {templateDescription}
            </div>
            {typeCounts && RenderTypeCounts(typeCounts)}
            <div className="flex-down ">
              <div className="flex space-between">
                <div className="program-option-search-match flex">
                  <span>{isComplete ? 'Full Match' : 'Partial Match'} </span>
                  {isComplete && fullMatch()}
                  {!isComplete && partialMatch()}
                </div>
                {/* {typeCounts && RenderTypeCounts(typeCounts)} */}
              </div>
              {alreadyPresent && (
                <div className="program-option-search-match">A template by this name is already loaded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
