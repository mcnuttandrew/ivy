import React from 'react';
import Thumbnail from './thumbnail';
import {classnames, buildCounts} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog, TiInfoLarge} from 'react-icons/ti';
import {HoverTooltip} from './tooltips';
import {Template} from '../types';

type TypeCounts = {[x: string]: number};
interface Props {
  alreadyPresent?: boolean;
  buttons: {name: string; onClick: any}[];
  isComplete?: boolean;
  hideMatches: boolean;
  setEncodingMode: any;
  template: Template;
  userName: string;
}

// function partialMatch(): JSX.Element {
//   return (
//     <Tooltip
//       placement="right"
//       trigger="click"
//       overlay={
//         <div className="tooltip-internal">
//           The search you have supplied on the left partially matches this template. It does not conflict, but
//           if you will need to supply extra fields to get a visualization.
//         </div>
//       }
//     >
//       <span className="tooltip-icon">
//         <TiInfoLarge />
//       </span>
//     </Tooltip>
//   );
// }

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

export function countSymbol(symbol: string): JSX.Element {
  return (
    <div className="count-symbol">
      {symbol.split('-').map((key, idx, arr) => {
        const circType = arr.length === 1 ? 'full' : arr.length === 2 ? 'half' : 'third';
        return (
          <div
            key={key}
            className={classnames({
              [`${circType}-circle`]: true,
              [`program-option-type-pill--${key.toLowerCase()}`]: true,
            })}
          ></div>
        );
      })}
    </div>
  );
}

const combos = [
  'DIMENSION-MEASURE-TIME',
  'DIMENSION-MEASURE',
  'DIMENSION-TIME',
  'MEASURE-TIME',
  'DIMENSION',
  'MEASURE',
  'TIME',
];
function RenderTypeCounts(typeCounts: TypeCounts): JSX.Element {
  const messages = combos
    .filter(d => typeCounts[d] > 0)
    .map((key: string) => {
      return (
        <HoverTooltip
          message={`The minimum number of required ${key.split('-').join(' or ')} columns to render`}
          key={key}
        >
          <div className={classnames({flex: true, 'cursor-pointer': true})}>
            {countSymbol(key)}
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
  const {alreadyPresent, buttons, isComplete, setEncodingMode, template, userName, hideMatches} = props;
  const {templateAuthor, templateDescription, templateName} = template;
  const typeCounts = buildCounts(template);
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
          <button type="button" className="use-button" onClick={(): any => setEncodingMode(templateName)}>
            USE
          </button>
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
            {!hideMatches && false && (
              <div className="program-option-search-match flex">
                {isComplete && <span> Full Match</span>}
                {isComplete && fullMatch()}
              </div>
            )}
          </div>
        </div>
      </div>
      {alreadyPresent && (
        <div className="program-option-search-match">This template already appears to be loaded</div>
      )}
    </div>
  );
}
