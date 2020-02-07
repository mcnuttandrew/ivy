import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import stringify from 'json-stringify-pretty-compact';
import {TiCog, TiEdit, TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

import Tooltip from 'rc-tooltip';
import {
  EDITOR_OPTIONS,
  JSON_OUTPUT,
  WIDGET_VALUES,
  WIDGET_CONFIGURATION,
  TEMPLATE_BODY,
} from '../constants/index';
import {GenericAction, HandleCodePayload} from '../actions';
import {Template, TemplateMap, TemplateWidget, WidgetSubType} from '../templates/types';
import {classnames, serializeTemplate, get} from '../utils';
import {synthesizeSuggestions, takeSuggestion, Suggestion} from '../utils/introspect';

interface Props {
  addWidget?: GenericAction<TemplateWidget<WidgetSubType>>;
  chainActions: GenericAction<any>;
  codeMode: string;
  editMode: boolean;
  editorError: null | string;
  editorFontSize: number;
  editorLineWrap: boolean;
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setEditorFontSize: GenericAction<number>;
  setEditorLineWrap: GenericAction<boolean>;
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
    this.editorDidMount = this.editorDidMount.bind(this);
    this.handleCodeUpdate = this.handleCodeUpdate.bind(this);
    this.state = {
      error: null,
      updateMode: 'automatic',
      suggestionBox: false,
    };
  }
  editorDidMount(editor: any): void {
    editor.focus();
    /* eslint-disable */
    // @ts-ignore
    import('monaco-themes/themes/Chrome DevTools.json').then(data => {
      // @ts-ignore
      monaco.editor.defineTheme('cobalt', data);
      // @ts-ignore
      monaco.editor.setTheme('cobalt');
    });
    /* eslint-enable */
  }

  componentDidUpdate(props: any): void {
    // on change code mode scroll to top
    if (props.codeMode !== this.props.codeMode) {
      /* eslint-disable */
      // @ts-ignore
      this.refs.monaco.editor.setScrollPosition({scrollTop: 0});
       /* eslint-enable */
    }
  }

  getCurrentCode(): string {
    const {template, codeMode, specCode, spec, templateMap} = this.props;
    if (codeMode === TEMPLATE_BODY) {
      return template ? template.code : specCode;
    }
    if (codeMode === WIDGET_CONFIGURATION) {
      return template ? serializeTemplate(template) : 'PARAMETERIZATION NOT AVAILABLE';
    }
    if (codeMode === JSON_OUTPUT) {
      return stringify(spec);
    }
    if (codeMode === WIDGET_VALUES) {
      return JSON.stringify(sortObjectAlphabetically(templateMap), null, 2);
      // return JSON.stringify(templateMap, null, 2);
    }
  }

  editorControls(): JSX.Element {
    const {
      setNewSpecCode,
      codeMode,
      editorFontSize,
      setEditorFontSize,
      editorLineWrap,
      setEditorLineWrap,
    } = this.props;
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
        <div className="flex">
          <span>{`Line wrap`}</span>
          {[
            {name: 'on', value: true},
            {name: 'off', value: false},
          ].map(row => {
            return (
              <button
                className={classnames({selected: row.value === editorLineWrap})}
                key={row.name}
                onClick={(): any => setEditorLineWrap(row.value)}
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
                if (codeMode !== TEMPLATE_BODY) {
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
      (template &&
        codeMode === TEMPLATE_BODY &&
        synthesizeSuggestions(currentCode, template.widgets || [])) ||
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
      <div className="code-controls flex background-2">
        <div className="flex code-option-tabs">
          {[
            {label: 'TEMPLATE', buttons: [TEMPLATE_BODY, WIDGET_CONFIGURATION]},
            {label: 'VIEW', buttons: [WIDGET_VALUES, JSON_OUTPUT]},
          ].map(({label, buttons}) => {
            return (
              <div
                key={label}
                className={classnames({
                  'code-option-tab-section': true,
                  'flex-down': true,
                  'option-disabled': !editMode && label === 'TEMPLATE',
                })}
              >
                <div>{label}</div>
                <div className="flex">
                  {buttons.map(key => {
                    return (
                      <div
                        className={classnames({'code-option-tab': true, 'selected-tab': key === codeMode})}
                        key={key}
                        onClick={(): any => setCodeMode(key)}
                      >
                        {key}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <Tooltip
          placement="top"
          trigger="hover"
          overlay={
            <span className="tooltip-internal">
              Change to edit mode, allows you to modify what gui elements are present and how they visually
              relate
            </span>
          }
        >
          <div
            className="flex save-edit-button cursor-pointer"
            onClick={(): any =>
              chainActions([
                (): any => setEditMode(!editMode),
                (): any => setCodeMode(editMode ? JSON_OUTPUT : TEMPLATE_BODY),
              ])
            }
          >
            <div>{editMode ? 'STOP EDIT' : 'START EDIT'}</div>
            <TiEdit />
          </div>
        </Tooltip>
        <Tooltip placement="right" trigger="click" overlay={this.editorControls()}>
          <div className="code-edit-controls-button cursor-pointer">
            <TiCog />
          </div>
        </Tooltip>
      </div>
    );
  }

  render(): JSX.Element {
    const {
      editMode,
      editorFontSize,
      editorLineWrap,
      codeMode,
      setProgrammaticView,
      showProgrammaticMode,
      chainActions,
      setCodeMode,
      setEditMode,
    } = this.props;
    console.log(editorLineWrap);
    const {updateMode} = this.state;
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
          <div className="full-height full-width flex-down">
            {this.controls()}
            <div className="flex-down full-height full-width">
              {editMode && this.suggestionBox()}
              {
                /*eslint-disable react/no-string-refs*/
                <MonacoEditor
                  ref="monaco"
                  language="json"
                  theme="monokai"
                  height={'calc(100%)'}
                  value={currentCode}
                  options={{
                    ...EDITOR_OPTIONS,
                    fontSize: editorFontSize,
                    wordWrap: editorLineWrap ? 'on' : 'off',
                  }}
                  onChange={(code: string): void => {
                    if (codeMode === JSON_OUTPUT) {
                      chainActions([(): any => setEditMode(true), (): any => setCodeMode(TEMPLATE_BODY)]);
                      return;
                    }

                    if (updateMode === 'automatic') {
                      this.handleCodeUpdate(code);
                    }
                  }}
                  editorDidMount={this.editorDidMount}
                />
                /*eslint-en able react/no-string-refs*/
              }
            </div>
          </div>
        )}
      </div>
    );
  }
}
