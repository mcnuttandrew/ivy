import React from 'react';
import MonacoWrapper from './monaco-wrapper';
import stringify from 'json-stringify-pretty-compact';

import {JSON_OUTPUT, WIDGET_VALUES, WIDGET_CONFIGURATION, TEMPLATE_BODY} from '../constants/index';
import {GenericAction, HandleCodePayload} from '../actions';
import {Template, TemplateMap, GenWidget, LanguageExtension, ColumnHeader} from '../types';
import {classnames, serializeTemplate, sortObjectAlphabetically} from '../utils';
import SuggestionBox from './suggestion-box';
import CodeEditorControls, {CodeCollapse} from './code-editor-controls';
import GALLERY from '../templates/gallery';

interface Props {
  addWidget?: GenericAction<GenWidget>;
  chainActions: GenericAction<any>;
  codeMode: string;
  columns: ColumnHeader[];
  currentView: string;
  editMode: boolean;
  editorError: null | string;
  editorFontSize: number;
  editorLineWrap: boolean;
  languages: {[x: string]: LanguageExtension};
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  setAllTemplateValues: GenericAction<TemplateMap>;
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

export default class CodeEditor extends React.Component<Props> {
  constructor(props: any) {
    super(props);
    this.handleCodeUpdate = this.handleCodeUpdate.bind(this);
  }

  getCurrentCode(): string {
    const {template, codeMode, spec, templateMap} = this.props;
    if (codeMode === TEMPLATE_BODY) {
      return `${template.code}\n`;
    }
    if (codeMode === WIDGET_CONFIGURATION) {
      return `${serializeTemplate(template)}\n`;
    }
    if (codeMode === JSON_OUTPUT) {
      return `${stringify(spec, {maxLength: 100})}\n`;
    }
    if (codeMode === WIDGET_VALUES) {
      return `${stringify({
        ...templateMap,
        paramValues: sortObjectAlphabetically(templateMap.paramValues),
      })}\n`;
    }
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
                    columns={this.props.columns}
                    currentCode={currentCode}
                    languages={this.props.languages}
                    handleCodeUpdate={this.handleCodeUpdate}
                    setAllTemplateValues={this.props.setAllTemplateValues}
                    template={this.props.template}
                  />
                )}
                <MonacoWrapper
                  codeMode={codeMode}
                  currentCode={currentCode}
                  editMode={this.props.editMode}
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
