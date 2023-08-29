import React, {useState} from 'react';
import {connect} from 'react-redux';
import stringify from '../utils/stringify';

import MonacoWrapper from '../components/monaco-wrapper';
import ErrorBoundary from '../components/error-boundary';
import GALLERY from '../templates/gallery';

import * as actionCreators from '../actions/index';

import {ActionUser} from '../actions/index';
import {
  getEditorFontSize,
  writeEditorFontSize,
  getEditorLineWrap,
  writeEditorLineWrap,
} from '../utils/local-storage';
import {evaluateIvyProgram} from '../ivy-lang';

import {Spec} from 'vega-typings';
import {AppState, ColumnHeader, DataReducerState, LanguageExtension, Template, TemplateMap} from '../types';

import {JSON_OUTPUT, WIDGET_VALUES, WIDGET_CONFIGURATION, TEMPLATE_BODY} from '../constants/index';
import {GenericAction, HandleCodePayload} from '../actions';
import {classnames, serializeTemplate, sortObjectAlphabetically} from '../utils';
import SuggestionBox from '../components/suggestion-box';
import CodeEditorControls, {CodeCollapse} from '../components/code-editor-controls';

interface CodeEditorProps extends ActionUser {
  codeMode: string;
  columns: ColumnHeader[];
  editMode: boolean;
  editorError: null | string;
  languages: {[x: string]: LanguageExtension};
  showProgrammaticMode: boolean;
  spec: Spec;
  template: Template;
  templateMap: TemplateMap;
  templates: Template[];
  triggerRepaint: any;
}
function CodeEditorContainer(props: CodeEditorProps): JSX.Element {
  const {codeMode, editMode, showProgrammaticMode, template, editorError} = props;
  const [editorLineWrap, setEditorLineWrap] = useState(getEditorLineWrap());
  const [editorFontSize, setEditorFontSize] = useState(getEditorFontSize());

  function handleCodeUpdate(code: string): void {
    const {setSpecCode, readInTemplate, readInTemplateMap, codeMode} = props;
    const responseFunctionMap: {[x: string]: GenericAction<HandleCodePayload>} = {
      [WIDGET_CONFIGURATION]: readInTemplate,
      [WIDGET_VALUES]: readInTemplateMap,
      [TEMPLATE_BODY]: setSpecCode,
    };
    Promise.resolve()
      .then(() => JSON.parse(code))
      .then(() => responseFunctionMap[codeMode]({code, inError: false}))
      .catch(() => responseFunctionMap[codeMode] && responseFunctionMap[codeMode]({code, inError: true}));
  }

  function getCurrentCode(): string {
    const {template, codeMode, spec, templateMap} = props;
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

  const currentCode = getCurrentCode();

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
            setProgrammaticView={props.setProgrammaticView}
          />
        )}
        {showProgrammaticMode && (
          <div className="full-height full-width flex-down">
            <CodeEditorControls
              addWidget={props.addWidget}
              codeMode={codeMode}
              editMode={props.editMode}
              editorFontSize={editorFontSize}
              editorLineWrap={editorLineWrap}
              readInTemplate={props.readInTemplate}
              readInTemplateMap={props.readInTemplateMap}
              setCodeMode={props.setCodeMode}
              setEditMode={props.setEditMode}
              setEditorFontSize={(size: number): void => {
                writeEditorFontSize(size);
                setEditorFontSize(size);
              }}
              setEditorLineWrap={(value: boolean): void => {
                writeEditorLineWrap(value);
                setEditorLineWrap(value);
              }}
              setProgrammaticView={props.setProgrammaticView}
              showProgrammaticMode={props.showProgrammaticMode}
              spec={props.spec}
              templateMap={props.templateMap}
            />
            <div className="flex-down full-height full-width">
              {editorError && <div className="error-bar">JSON ERROR</div>}
              {codeMode === JSON_OUTPUT && <div className="warning-bar">CODE IN THIS TAB IS READ ONLY</div>}
              {editMode && codeMode === TEMPLATE_BODY && (
                <ErrorBoundary>
                  <SuggestionBox
                    addWidget={props.addWidget}
                    codeMode={props.codeMode}
                    columns={props.columns}
                    currentCode={currentCode}
                    languages={props.languages}
                    handleCodeUpdate={handleCodeUpdate}
                    setAllTemplateValues={props.setAllTemplateValues}
                    template={props.template}
                  />
                </ErrorBoundary>
              )}
              <ErrorBoundary>
                <MonacoWrapper
                  codeMode={codeMode}
                  currentCode={currentCode}
                  editMode={props.editMode}
                  editorFontSize={editorFontSize}
                  editorLineWrap={editorLineWrap}
                  handleCodeUpdate={handleCodeUpdate}
                  setCodeMode={props.setCodeMode}
                  setEditMode={props.setEditMode}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function mapStateToProps({base}: {base: AppState; data: DataReducerState}): any {
  const template = base.currentTemplateInstance;
  const templateMap = base.templateMap;
  const isGallery = template && GALLERY.templateName === template.templateName;
  const spec = evaluateIvyProgram(template, templateMap);
  return {
    codeMode: base.codeMode,
    columns: base.columns,
    editMode: isGallery ? false : base.editMode,
    editorError: base.editorError,
    showProgrammaticMode: isGallery ? false : base.showProgrammaticMode,
    spec,
    template,
    templateMap,
    templates: base.templates,
  };
}

export default connect(mapStateToProps, actionCreators)(CodeEditorContainer);
