import React from 'react';
import MonacoWrapper from './monaco-wrapper';
import stringify from 'json-stringify-pretty-compact';
import {TiCog, TiEdit, TiArrowSortedDown, TiArrowSortedUp} from 'react-icons/ti';

import Tooltip from 'rc-tooltip';
import {
  JSON_OUTPUT,
  WIDGET_VALUES,
  WIDGET_CONFIGURATION,
  TEMPLATE_BODY,
  NONE_TEMPLATE,
} from '../constants/index';
import {GenericAction, HandleCodePayload} from '../actions';
import {Template, TemplateMap, TemplateWidget, WidgetSubType} from '../templates/types';
import {classnames, serializeTemplate, get, sortObjectAlphabetically, getTemplateName} from '../utils';
import {synthesizeSuggestions, takeSuggestion, Suggestion} from '../utils/introspect';

interface Props {
  addWidget?: GenericAction<TemplateWidget<WidgetSubType>>;
  chainActions: GenericAction<any>;
  codeMode: string;
  currentView: string;
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
interface State {
  suggestionBox: boolean;
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

export default class CodeEditor extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.handleCodeUpdate = this.handleCodeUpdate.bind(this);
    this.state = {
      suggestionBox: false,
    };
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
    const {template, setCodeMode, codeMode, editMode, setEditMode, chainActions, currentView} = this.props;
    return (
      <div className="code-controls flex background-2 space-between">
        <div className="flex code-option-tabs">
          {[
            {label: `Template: ${getTemplateName(template)}`, buttons: [TEMPLATE_BODY, WIDGET_CONFIGURATION]},
            {label: `View: ${currentView}`, buttons: [WIDGET_VALUES, JSON_OUTPUT]},
          ].map(({label, buttons}) => {
            return (
              <div
                key={label}
                className={classnames({
                  'code-option-tab-section': true,
                  'flex-down': true,
                  'option-disabled': !editMode && label === 'Template',
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
        <div className="flex-down">
          {this.codeCollapse()}
          <div className="flex code-controls-buttons">
            <Tooltip
              placement="bottom"
              trigger="hover"
              overlay={
                <span className="tooltip-internal">
                  Change to edit mode, allows you to modify what gui elements are present and how they
                  visually relate
                </span>
              }
            >
              <div
                className="flex template-modification-control cursor-pointer"
                onClick={(): any =>
                  chainActions([
                    (): any => setEditMode(!editMode),
                    (): any => setCodeMode(editMode ? JSON_OUTPUT : TEMPLATE_BODY),
                  ])
                }
              >
                <div className="template-modification-control-icon">
                  <TiEdit />
                </div>
                <span className="template-modification-control-label">
                  {editMode ? 'Stop Edit' : 'Start Edit'}
                </span>
              </div>
            </Tooltip>
            <Tooltip placement="right" trigger="click" overlay={this.editorControls()}>
              <div className="code-edit-controls-button cursor-pointer">
                <TiCog />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  codeCollapse(): JSX.Element {
    const {showProgrammaticMode, setProgrammaticView} = this.props;
    return (
      <div
        className={classnames({
          'background-2': true,
          'code-collapse': true,
          collapsed: !showProgrammaticMode,
        })}
        onClick={(): any => setProgrammaticView()}
      >
        <div>{showProgrammaticMode ? 'Hide Code' : 'Show Code'}</div>
        {showProgrammaticMode ? <TiArrowSortedDown /> : <TiArrowSortedUp />}
      </div>
    );
  }

  render(): JSX.Element {
    const {editMode, showProgrammaticMode} = this.props;
    return (
      <div
        className={classnames({
          'full-width': true,
          'flex-down': true,
          'full-height': showProgrammaticMode,
        })}
      >
        <div className="full-height full-width code-container flex-down">
          {!showProgrammaticMode && this.codeCollapse()}
          {showProgrammaticMode && (
            <div className="full-height full-width flex-down">
              {this.controls()}
              <div className="flex-down full-height full-width">
                {editMode && this.suggestionBox()}
                <MonacoWrapper
                  chainActions={this.props.chainActions}
                  codeMode={this.props.codeMode}
                  currentCode={this.getCurrentCode()}
                  editMode={editMode}
                  editorFontSize={this.props.editorFontSize}
                  editorLineWrap={this.props.editorLineWrap}
                  readInTemplate={this.props.readInTemplate}
                  readInTemplateMap={this.props.readInTemplateMap}
                  setCodeMode={this.props.setCodeMode}
                  setEditMode={this.props.setEditMode}
                  setNewSpecCode={this.props.setNewSpecCode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
