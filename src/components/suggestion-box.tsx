import React, {useState} from 'react';

import {TiCog, TiEdit, TiArrowSortedDown, TiArrowSortedUp, TiInfoLarge} from 'react-icons/ti';

import Tooltip from 'rc-tooltip';
import {JSON_OUTPUT, WIDGET_VALUES, WIDGET_CONFIGURATION, TEMPLATE_BODY} from '../constants/index';
import {GenericAction} from '../actions';
import {Template, TemplateMap, TemplateWidget, WidgetSubType} from '../templates/types';
import {synthesizeSuggestions, takeSuggestion, Suggestion} from '../utils/introspect';

interface Props {
  addWidget?: GenericAction<TemplateWidget<WidgetSubType>>;
  codeMode: string;
  currentCode: string;
  handleCodeUpdate: (code: string) => void;
  template?: Template;
}

interface RenderSuggestionProps {
  addWidget?: GenericAction<TemplateWidget<WidgetSubType>>;
  handleCodeUpdate: (code: string) => void;
  suggestion: Suggestion;
  currentCode: string;
}

function renderSuggestion(props: RenderSuggestionProps): JSX.Element {
  const {suggestion, currentCode, addWidget, handleCodeUpdate} = props;
  const {from, to, comment = '', sideEffect} = suggestion;
  return (
    <button
      onClick={(): void => {
        handleCodeUpdate(takeSuggestion(currentCode, suggestion));
        if (sideEffect) {
          addWidget(sideEffect());
        }
      }}
      key={`${from} -> ${to}-${0}`}
    >
      {comment}
    </button>
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
            suggestions.map(suggestion =>
              renderSuggestion({
                addWidget,
                currentCode,
                suggestion,
                handleCodeUpdate,
              }),
            )}
        </div>
      )}
    </div>
  );
}
