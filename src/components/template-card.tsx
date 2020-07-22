import React from 'react';
import Thumbnail from './thumbnail';
import {classnames, buildCounts, serializeTemplate} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog, TiInfoLarge} from 'react-icons/ti';
import {HoverTooltip} from './tooltips';
import {Template} from '../types';

const FOR_DISPLAY = false;
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
      <div className="template-card-settings">
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
              [`template-card-type-pill--${key.toLowerCase()}`]: true,
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

function combosToMessages(typeCounts: TypeCounts): JSX.Element[] {
  return combos
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
}
function computeLinesOfCode(template: Template): number {
  const bodyLines = template.code.trim().split('\n').length;
  const templateWithoutBodyLines =
    serializeTemplate(template)
      .trim()
      .split('\n').length - 1;
  return bodyLines + templateWithoutBodyLines;
}
function RenderTypeCounts(template: Template): JSX.Element {
  const messages = combosToMessages(buildCounts(template));
  const maxMessages = combosToMessages(buildCounts(template, true));
  return (
    <div className="flex flex-wrap">
      <div className="flex">
        <div>{messages.length ? 'Requires' : 'No Fields Required'}</div>
        <div className="flex flex-wrap">{messages}</div>
      </div>
      {FOR_DISPLAY && (
        <div className="flex margin-left">
          <div>Max Allowed</div>
          {maxMessages.length > 0 && (
            <div className="flex flex-wrap">{combosToMessages(buildCounts(template, true))}</div>
          )}
          {!maxMessages.length && (
            <div className="margin-left">
              {template.widgets.find(d => new Set(['DataTarget', 'MultiDataTarget']).has(d.type))
                ? '∞'
                : 'None'}
            </div>
          )}
        </div>
      )}
      {FOR_DISPLAY && <div className="flex">{`Lines of code: ${computeLinesOfCode(template)}`}</div>}
      {FOR_DISPLAY && <div className="flex margin-left">{`Language: ${template.templateLanguage}`}</div>}
    </div>
  );
}

export default function ProgramPreview(props: Props): JSX.Element {
  const {alreadyPresent, buttons, isComplete, setEncodingMode, template, userName, hideMatches} = props;
  const {templateAuthor, templateDescription, templateName} = template;

  return (
    <div
      className={classnames({
        'template-card': true,
        'flex-down': true,
      })}
    >
      <div className="flex">
        <div className="flex-down template-card-use-template-container">
          <div className="template-card-img-container" onClick={(): any => setEncodingMode(templateName)}>
            <Thumbnail templateName={templateName} templateAuthor={templateAuthor} />
          </div>
          {!FOR_DISPLAY && (
            <button type="button" className="use-button" onClick={(): any => setEncodingMode(templateName)}>
              USE
            </button>
          )}
        </div>
        <div className="flex-down full-width">
          <div className="template-card-title">
            <h3
              className="template-card-title-label cursor-pointer"
              onClick={(): any => setEncodingMode(templateName)}
            >
              {templateName}
            </h3>
            {/* {!FOR_DISPLAY && CardControls({buttons, templateName, templateAuthor, userName})} */}
          </div>
          <div className="flex-down">
            <div
              className="template-card-description cursor-pointer"
              onClick={(): any => setEncodingMode(templateName)}
            >
              {templateDescription}
            </div>
            {!FOR_DISPLAY && RenderTypeCounts(template)}
            {!hideMatches && false && (
              <div className="template-card-search-match flex">
                {isComplete && <span> Full Match</span>}
                {isComplete && fullMatch()}
              </div>
            )}
          </div>
        </div>
      </div>
      {alreadyPresent && (
        <div className="template-card-search-match">This template already appears to be loaded</div>
      )}
      {FOR_DISPLAY && RenderTypeCounts(template)}
    </div>
  );
}
