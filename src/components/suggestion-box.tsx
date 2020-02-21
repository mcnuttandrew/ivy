import React, {useState} from 'react';

import {TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

import Tooltip from 'rc-tooltip';
import {TEMPLATE_BODY} from '../constants/index';
import {GenericAction} from '../actions';
import {Template, GenWidget, Suggestion, HydraExtension} from '../types';

/**
 * Apply suggestion to code to generate updated code
 * @param code
 * @param suggestion
 */
export function takeSuggestion(code: string, suggestion: Suggestion): string {
  const {simpleReplace, from, to, codeEffect} = suggestion;
  if (codeEffect) {
    return codeEffect(code);
  }
  return simpleReplace ? code.replace(from, to) : code.replace(new RegExp(from, 'g'), to);
}

interface Props {
  addWidget?: GenericAction<GenWidget>;
  codeMode: string;
  currentCode: string;
  handleCodeUpdate: (code: string) => void;
  languages: {[x: string]: HydraExtension};
  template: Template;
}

interface RenderSuggestionProps {
  addWidget?: GenericAction<GenWidget>;
  handleCodeUpdate: (code: string) => void;
  suggestions: Suggestion[];
  currentCode: string;
}

function renderSuggestion(props: RenderSuggestionProps, idx?: number): JSX.Element {
  const {suggestions, currentCode, addWidget, handleCodeUpdate} = props;

  function singleSuggestionButton(suggestion: Suggestion): JSX.Element {
    const {comment = '', sideEffect} = suggestion;
    return (
      <button
        onClick={(): void => {
          handleCodeUpdate(takeSuggestion(currentCode, suggestion));
          if (sideEffect) {
            addWidget(sideEffect());
          }
        }}
      >
        {comment}
      </button>
    );
  }
  if (suggestions.length === 1) {
    return singleSuggestionButton(suggestions[0]);
  }
  return (
    <Tooltip
      placement="top"
      trigger="click"
      key={`${suggestions[0].from} -> ${idx}`}
      overlay={<div className="suggestion-tooltip flex-down">{suggestions.map(singleSuggestionButton)}</div>}
    >
      <button>{`${suggestions[0].from} -> ?`}</button>
    </Tooltip>
  );
}

// this maybe can become a memoize? I kinda forget how react memoize works?
export default function suggestionBox(props: Props): JSX.Element {
  const {codeMode, template, addWidget, languages, currentCode, handleCodeUpdate} = props;
  const [suggestionBox, setSuggestionBox] = useState(true);
  // TODO this should move out of the render path
  const suggestionEngine = languages[template.templateLanguage].suggestion;
  const suggestions =
    (template &&
      codeMode === TEMPLATE_BODY &&
      suggestionEngine &&
      suggestionEngine(currentCode, template.widgets || [])) ||
    [];
  const suggestionGroups = suggestions.reduce((acc: {[x: string]: Suggestion[]}, row) => {
    acc[row.from] = (acc[row.from] || []).concat(row);
    return acc;
  }, {});
  return (
    <div className="suggestion-box">
      <div
        className="suggestion-box-header flex space-between"
        onClick={(): any => setSuggestionBox(!suggestionBox)}
      >
        <h5>{`Suggestions (${suggestions.length})`}</h5>
        <div>{suggestionBox ? <TiArrowSortedDown /> : <TiArrowSortedUp />}</div>
      </div>
      {suggestionBox && suggestions.length > 0 && (
        <div className="suggestion-box-body">
          {template &&
            Object.values(suggestionGroups).map((suggestionGroup: Suggestion[]) =>
              renderSuggestion({
                addWidget,
                currentCode,
                suggestions: suggestionGroup,
                handleCodeUpdate,
              }),
            )}
        </div>
      )}
    </div>
  );
}
