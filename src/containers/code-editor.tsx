import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';

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

import CodeEditor from '../components/code-editor';

interface RootProps extends ActionUser {
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

// may need
// , triggerRepaint: any
function CodeEditorContainer(props: RootProps): JSX.Element {
  return (
    <CodeEditor
      addWidget={props.addWidget}
      codeMode={props.codeMode}
      columns={props.columns}
      editMode={props.editMode}
      editorLineWrap={getEditorLineWrap()}
      editorError={props.editorError}
      editorFontSize={getEditorFontSize()}
      languages={props.languages}
      readInTemplate={props.readInTemplate}
      readInTemplateMap={props.readInTemplateMap}
      setCodeMode={props.setCodeMode}
      setEditMode={props.setEditMode}
      setSpecCode={props.setSpecCode}
      setEditorFontSize={(size: number): void => {
        writeEditorFontSize(size);
        props.triggerRepaint();
      }}
      setEditorLineWrap={(value: boolean): void => {
        writeEditorLineWrap(value);
        props.triggerRepaint();
      }}
      setAllTemplateValues={props.setAllTemplateValues}
      setProgrammaticView={props.setProgrammaticView}
      showProgrammaticMode={props.showProgrammaticMode}
      spec={props.spec}
      template={props.template}
      templateMap={props.templateMap}
    />
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
