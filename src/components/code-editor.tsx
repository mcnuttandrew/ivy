import React from 'react';
import MonacoWrapper from './monaco-wrapper';
import stringify from 'json-stringify-pretty-compact';

import {JSON_OUTPUT, WIDGET_VALUES, WIDGET_CONFIGURATION, TEMPLATE_BODY} from '../constants/index';
import {GenericAction, HandleCodePayload} from '../actions';
import {Template, TemplateMap, GenWidget, HydraExtension} from '../types';
import {classnames, serializeTemplate, get, sortObjectAlphabetically} from '../utils';
import SuggestionBox from './suggestion-box';
import CodeEditorControls, {CodeCollapse} from './code-editor-controls';
import GALLERY from '../templates/gallery';

interface Props {
  addWidget?: GenericAction<GenWidget>;
  chainActions: GenericAction<any>;
  codeMode: string;
  currentView: string;
  editMode: boolean;
  editorError: null | string;
  editorFontSize: number;
  editorLineWrap: boolean;
  languages: {[x: string]: HydraExtension};
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setEditorFontSize: any;
  setEditorLineWrap: any;
  setNewSpecCode: GenericAction<HandleCodePayload>;
  setProgrammaticView: GenericAction<boolean>;
  showProgrammaticMode: boolean;
  spec: any;
  template: Template;
  templateMap: TemplateMap;
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

const fontSizes = [
  {name: 'small', value: 10},
  {name: 'medium', value: 15},
  {name: 'large', value: 20},
];
const lineWraps = [
  {name: 'on', value: true},
  {name: 'off', value: false},
];

export default class CodeEditor extends React.Component<Props> {
  constructor(props: any) {
    super(props);
    this.handleCodeUpdate = this.handleCodeUpdate.bind(this);
  }

  getCurrentCode(): string {
    const {template, codeMode, spec, templateMap} = this.props;
    if (codeMode === TEMPLATE_BODY) {
      return template.code;
    }
    if (codeMode === WIDGET_CONFIGURATION) {
      return serializeTemplate(template);
    }
    if (codeMode === JSON_OUTPUT) {
      return stringify(spec);
    }
    if (codeMode === WIDGET_VALUES) {
      return JSON.stringify(sortObjectAlphabetically(templateMap), null, 2);
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
    const EDITOR_CONTROLS: any[] = [
      {name: 'Font Size', options: fontSizes, update: setEditorFontSize, current: editorFontSize},
      {name: 'Line wrap', options: lineWraps, update: setEditorLineWrap, current: editorLineWrap},
    ];
    return (
      <div className="flex-down code-editor-controls">
        <h3>Controls</h3>
        {EDITOR_CONTROLS.map(control => {
          return (
            <div className="flex" key={control.name}>
              <span>{control.name}</span>
              {control.options.map((row: any) => {
                return (
                  <button
                    className={classnames({selected: row.value === control.current})}
                    key={row.name}
                    onClick={(): any => control.update(row.value)}
                  >
                    {row.name}
                  </button>
                );
              })}
            </div>
          );
        })}
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
      [WIDGET_CONFIGURATION]: readInTemplate,
      [WIDGET_VALUES]: readInTemplateMap,
      [TEMPLATE_BODY]: setNewSpecCode,
    };
    Promise.resolve()
      .then(() => JSON.parse(code))
      .then(() => responseFunctionMap[codeMode]({code, inError: false}))
      .catch(() => responseFunctionMap[codeMode]({code, inError: true}));
  }

  render(): JSX.Element {
    const {codeMode, editMode, showProgrammaticMode, template} = this.props;
    const currentCode = this.getCurrentCode();
    return (
      <div
        className={classnames({
          'full-width': true,
          'flex-down': true,
          'full-height': showProgrammaticMode,
        })}
      >
        <div className="full-height full-width code-container flex-down">
          {!showProgrammaticMode && (
            <CodeCollapse
              disable={template && template.templateName === GALLERY.templateName}
              showProgrammaticMode={showProgrammaticMode}
              setProgrammaticView={this.props.setProgrammaticView}
            />
          )}
          {showProgrammaticMode && (
            <div className="full-height full-width flex-down">
              <CodeEditorControls
                addWidget={this.props.addWidget}
                chainActions={this.props.chainActions}
                codeMode={codeMode}
                currentView={this.props.currentView}
                currentCode={currentCode}
                editMode={this.props.editMode}
                editorError={this.props.editorError}
                editorFontSize={this.props.editorFontSize}
                editorLineWrap={this.props.editorLineWrap}
                readInTemplate={this.props.readInTemplate}
                readInTemplateMap={this.props.readInTemplateMap}
                setCodeMode={this.props.setCodeMode}
                setEditMode={this.props.setEditMode}
                setEditorFontSize={this.props.setEditorFontSize}
                setEditorLineWrap={this.props.setEditorLineWrap}
                setNewSpecCode={this.props.setNewSpecCode}
                setProgrammaticView={this.props.setProgrammaticView}
                showProgrammaticMode={this.props.showProgrammaticMode}
                spec={this.props.spec}
                template={this.props.template}
                templateMap={this.props.templateMap}
              />
              <div className="flex-down full-height full-width">
                {editMode && codeMode === TEMPLATE_BODY && (
                  <SuggestionBox
                    addWidget={this.props.addWidget}
                    codeMode={this.props.codeMode}
                    languages={this.props.languages}
                    currentCode={currentCode}
                    handleCodeUpdate={this.handleCodeUpdate}
                    template={this.props.template}
                  />
                )}
                <MonacoWrapper
                  chainActions={this.props.chainActions}
                  codeMode={codeMode}
                  currentCode={currentCode}
                  editorFontSize={this.props.editorFontSize}
                  editorLineWrap={this.props.editorLineWrap}
                  handleCodeUpdate={this.handleCodeUpdate}
                  setCodeMode={this.props.setCodeMode}
                  setEditMode={this.props.setEditMode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
