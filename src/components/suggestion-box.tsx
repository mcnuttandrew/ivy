import React, {useState} from 'react';

import {TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

import Tooltip from 'rc-tooltip';
import {TEMPLATE_BODY} from '../constants/index';
import {GenericAction} from '../actions';
import {Template, GenWidget} from '../templates/types';
import {synthesizeSuggestions, takeSuggestion, Suggestion} from '../utils/introspect';

interface Props {
  addWidget?: GenericAction<GenWidget>;
  codeMode: string;
  currentCode: string;
  handleCodeUpdate: (code: string) => void;
  template?: Template;
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
  const {codeMode, template, addWidget, currentCode, handleCodeUpdate} = props;
  const [suggestionBox, setSuggestionBox] = useState(true);
  // TODO this should move out of the render path
  const suggestions =
    (template && codeMode === TEMPLATE_BODY && synthesizeSuggestions(currentCode, template.widgets || [])) ||
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
