import React, {Suspense} from 'react';
import stringify from 'json-stringify-pretty-compact';
import {TiCog, TiEdit, TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

const Editor = React.lazy(() =>
  import(/* webpackChunkName: "monaco-component-wrapper" */ './monaco-wrap').then(module => ({
    default: module.default,
  })),
);

import Popover from './popover';
import {GenericAction, HandleCodePayload} from '../actions';
import {Template, TemplateMap, TemplateWidget, WidgetSubType} from '../templates/types';
import {classnames, serializeTemplate, get} from '../utils';
import {synthesizeSuggestions, takeSuggestion, Suggestion} from '../utils/introspect';

interface Props {
  addWidget?: GenericAction<TemplateWidget<WidgetSubType>>;
  codeMode: string;
  chainActions: GenericAction<any>;
  editorError: null | string;
  editMode: boolean;
  editorFontSize: number;
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  setCodeMode: GenericAction<string>;
  setEditorFontSize: GenericAction<number>;
  setEditMode: GenericAction<boolean>;
  setNewSpecCode: GenericAction<HandleCodePayload>;
  setProgrammaticView: GenericAction<void>;
  showProgrammaticMode: boolean;
  spec: any;
  specCode: string;
  template?: Template;
  templateMap?: TemplateMap;
}
type updateMode = 'automatic' | 'manual';
interface State {
  error?: string;
  suggestionBox: boolean;
  updateMode: updateMode;
}

const SHORTCUTS = [
  {
    name: 'Add Height/Width',
    action: (code: any): any => {
      const usingNested = !!code.spec;
      if (usingNested) {
        code.spec.height = 500;
        code.spec.width = 500;
      } else {
        code.height = 500;
        code.width = 500;
      }
      return code;
    },
    description: 'Insert height and width values in to the current template',
  },
  {
    name: 'Clean Up',
    action: (code: any): any => code,
    description: 'Clean up the formatting of the current code',
  },
  {
    name: 'Swap x and y',
    action: (code: any): any => {
      if (get(code, ['encoding', 'x', 'field']) && get(code, ['encoding', 'y', 'field'])) {
        const xTemp = code.encoding.x.field;
        code.encoding.x.field = code.encoding.y.field;
        code.encoding.y.field = xTemp;
      }
      return code;
    },
    description: 'Swap the x and y dimensions of encoding if they exist',
  },
];

function sortObjectAlphabetically(obj: any): any {
  return Object.entries(obj)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((acc: any, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {});
}

export default class CodeEditor extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.handleCodeUpdate = this.handleCodeUpdate.bind(this);
    this.state = {
      error: null,
      updateMode: 'automatic',
      suggestionBox: false,
    };
  }

  getCurrentCode(): string {
    const {template, codeMode, specCode, spec, templateMap} = this.props;
    if (codeMode === 'TEMPLATE') {
      return template ? template.code : specCode;
    }
    if (codeMode === 'PARAMETERS') {
      return template ? serializeTemplate(template) : 'PARAMETERIZATION NOT AVAILABLE';
    }
    if (codeMode === 'EXPORT TO JSON') {
      return stringify(spec);
    }
    if (codeMode === 'SPECIFICATION') {
      return JSON.stringify(sortObjectAlphabetically(templateMap), null, 2);
      // return JSON.stringify(templateMap, null, 2);
    }
  }

  editorControls(): JSX.Element {
    const {setNewSpecCode, codeMode, editorFontSize, setEditorFontSize} = this.props;
    const fontSizes = [
      {name: 'small', size: 10},
      {name: 'medium', size: 15},
      {name: 'large', size: 20},
    ];
    return (
      <div className="flex-down code-editor-controls">
        <h3>Controls</h3>
        <div className="flex">
          <span>{`Font Size `}</span>
          {fontSizes.map(row => {
            return (
              <button
                className={classnames({selected: row.size === editorFontSize})}
                key={row.name}
                onClick={(): any => setEditorFontSize(row.size)}
              >
                {row.name}
              </button>
            );
          })}
        </div>
        <h3>Text Manipulation Shortcuts</h3>
        {SHORTCUTS.map((shortcut: any) => {
          const {action, name, description} = shortcut;
          return (
            <div
              className="flex-down"
              key={name}
              onClick={(): void => {
                if (codeMode !== 'TEMPLATE') {
                  return;
                }
                setNewSpecCode({
                  code: stringify(action(JSON.parse(this.getCurrentCode()))),
                  inError: false,
                });
              }}
            >
              <button>{name}</button>
              <div>{description}</div>
            </div>
          );
        })}
      </div>
    );
  }

  handleCodeUpdate(code: string): void {
    const {setNewSpecCode, readInTemplate, readInTemplateMap, codeMode} = this.props;
    const responseFunctionMap: {[x: string]: GenericAction<HandleCodePayload>} = {
      PARAMETERS: readInTemplate,
      SPECIFICATION: readInTemplateMap,
      TEMPLATE: setNewSpecCode,
    };
    Promise.resolve()
      .then(() => JSON.parse(code))
      .then(() => responseFunctionMap[codeMode]({code, inError: false}))
      .catch(() => responseFunctionMap[codeMode]({code, inError: true}));
  }

  suggestionBox(): JSX.Element {
    const {codeMode, template, addWidget} = this.props;
    const {suggestionBox} = this.state;
    const currentCode = this.getCurrentCode();
    // TODO this should move out of the render path
    const suggestions =
      (template && codeMode === 'TEMPLATE' && synthesizeSuggestions(currentCode, template.widgets || [])) ||
      [];
    return (
      <div className="suggestion-box">
        <div
          className="suggestion-box-header flex space-between"
          onClick={(): any => this.setState({suggestionBox: !suggestionBox})}
        >
          <h5>
            <span>Suggestions</span>
            {suggestions.length ? <span>(!)</span> : ''}
          </h5>
          <div>{suggestionBox ? <TiArrowSortedDown /> : <TiArrowSortedUp />}</div>
        </div>
        {suggestionBox && (
          <div className="suggestion-box-body">
            {template &&
              suggestions.map((suggestion: Suggestion, idx: number) => {
                const {from, to, comment = '', sideEffect} = suggestion;
                return (
                  <button
                    onClick={(): void => {
                      this.handleCodeUpdate(takeSuggestion(currentCode, suggestion));
                      if (sideEffect) {
                        addWidget(sideEffect());
                      }
                    }}
                    key={`${from} -> ${to}-${idx}`}
                  >
                    {comment}
                  </button>
                );
              })}
          </div>
        )}
      </div>
    );
  }

  controls(): JSX.Element {
    const {setCodeMode, codeMode, editMode, setEditMode, chainActions} = this.props;
    return (
      <div className="code-option-tabs flex-down full-height background-2">
        <div
          className="flex save-edit-button"
          onClick={(): any =>
            chainActions([
              (): any => setEditMode(!editMode),
              (): any => setCodeMode(editMode ? 'EXPORT TO JSON' : 'TEMPLATE'),
            ])
          }
        >
          <div>{editMode ? 'SAVE' : 'EDIT'}</div>
          <TiEdit />
        </div>
        <Popover clickTarget={<TiCog />} body={(): JSX.Element => this.editorControls()} />

        {[editMode && 'TEMPLATE', editMode && 'PARAMETERS', 'SPECIFICATION', 'EXPORT TO JSON']
          .filter(d => d)
          .map(key => {
            return (
              <div
                className={classnames({
                  'code-option-tab': true,
                  'selected-tab': key === codeMode,
                })}
                key={key}
                onClick={(): any => setCodeMode(key)}
              >
                {key}
              </div>
            );
          })}
      </div>
    );
  }

  render(): JSX.Element {
    const {editMode, setProgrammaticView, showProgrammaticMode} = this.props;
    const currentCode = this.getCurrentCode();
    return (
      <div className="full-height full-width code-container flex-down">
        <div
          className="full-width background-2 cursor-pointer flex code-collapse"
          onClick={(): any => setProgrammaticView()}
        >
          <div>{showProgrammaticMode ? 'Hide Code' : 'Show Code'}</div>
          {showProgrammaticMode ? <TiArrowSortedDown /> : <TiArrowSortedUp />}
        </div>
        {showProgrammaticMode && (
          <div className="full-height full-width flex">
            {this.controls()}
            <div className="flex-down full-height full-width">
              {editMode && this.suggestionBox()}
              <Suspense fallback={<div>Loading...</div>}>
                <Editor
                  codeMode={this.props.codeMode}
                  currentCode={currentCode}
                  chainActions={this.props.chainActions}
                  editorFontSize={this.props.editorFontSize}
                  setCodeMode={this.props.setCodeMode}
                  setEditMode={this.props.setEditMode}
                  spec={this.props.spec}
                  specCode={this.props.specCode}
                  template={this.props.template}
                  templateMap={this.props.templateMap}
                  updateMode={this.state.updateMode}
                  handleCodeUpdate={this.handleCodeUpdate}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    );
  }
}
