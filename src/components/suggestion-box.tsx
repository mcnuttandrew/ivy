import React, {useState} from 'react';

import {TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

import Tooltip from 'rc-tooltip';
import {TEMPLATE_BODY} from '../constants/index';
import {GenericAction} from '../actions';
import {Template, GenWidget, Suggestion, HydraExtension, ColumnHeader, TemplateMap} from '../types';
import {takeSuggestion} from '../utils/index';

interface Props {
  addWidget?: GenericAction<GenWidget>;
  codeMode: string;
  columns: ColumnHeader[];
  currentCode: string;
  handleCodeUpdate: (code: string) => void;
  languages: {[x: string]: HydraExtension};
  setAllTemplateValues: GenericAction<TemplateMap>;
  template: Template;
}

interface RenderSuggestionProps {
  addWidget?: GenericAction<GenWidget>;
  handleCodeUpdate: (code: string) => void;
  setAllTemplateValues: GenericAction<TemplateMap>;
  suggestions: Suggestion[];
  currentCode: string;
}

function renderSuggestion(props: RenderSuggestionProps, idx: number): JSX.Element {
  const {suggestions, currentCode, addWidget, handleCodeUpdate, setAllTemplateValues} = props;

  function singleSuggestionButton(suggestion: Suggestion): JSX.Element {
    const {comment = '', sideEffect} = suggestion;
    return (
      <button
        type="button"
        key={`${idx}-button-${comment}`}
        onClick={(): void => {
          handleCodeUpdate(takeSuggestion(currentCode, suggestion));
          if (sideEffect) {
            const sideEffectResult = sideEffect(setAllTemplateValues);
            if (sideEffectResult) {
              addWidget(sideEffectResult);
            }
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
      <button type="button">{`${suggestions[0].from} -> ?`}</button>
    </Tooltip>
  );
}

// this maybe can become a memoize? I kinda forget how react memoize works?
export default function suggestionBox(props: Props): JSX.Element {
  const {
    addWidget,
    codeMode,
    columns,
    currentCode,
    handleCodeUpdate,
    languages,
    setAllTemplateValues,
    template,
  } = props;
  const [suggestionBox, setSuggestionBox] = useState(true);
  // TODO this should move out of the render path
  const suggestionEngine =
    languages[template.templateLanguage] && languages[template.templateLanguage].suggestion;
  const suggestions =
    (template &&
      codeMode === TEMPLATE_BODY &&
      suggestionEngine &&
      suggestionEngine(currentCode, template.widgets || [], columns)) ||
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
            Object.values(suggestionGroups).map((suggestionGroup: Suggestion[], idx) =>
              renderSuggestion(
                {
                  addWidget,
                  currentCode,
                  suggestions: suggestionGroup,
                  handleCodeUpdate,
                  setAllTemplateValues,
                },
                idx,
              ),
            )}
        </div>
      )}
    </div>
  );
}
