import React from 'react';
import {connect} from 'react-redux';
import ChartArea from '../components/chart-area';
import * as actionCreators from '../actions/index';
import {DataRow, ActionUser} from '../actions/index';
import {
  AppState,
  ColumnHeader,
  DataReducerState,
  Json,
  LanguageExtension,
  Template,
  TemplateMap,
  ViewCatalog,
} from '../types';
import {evaluateIvyProgram, getMissingFields} from '../ivy-lang';
interface ChartContainerProps extends ActionUser {
  columns: ColumnHeader[];
  currentView: string;
  currentlySelectedFile: string;
  data: DataRow[];
  editMode: boolean;
  editorError: null | string;
  encodingMode: string;
  languages: {[x: string]: LanguageExtension};
  missingFields: string[];
  spec: any;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templates: Template[];
  views: string[];
  viewCatalog: ViewCatalog;
  width: number;
}

// may need?
// , width: number
function ChartAreaWrapper(props: ChartContainerProps): JSX.Element {
  return (
    <ChartArea
      chainActions={props.chainActions}
      changeViewName={props.changeViewName}
      cloneView={props.cloneView}
      columns={props.columns}
      createNewView={props.createNewView}
      currentView={props.currentView}
      data={props.data}
      deleteView={props.deleteView}
      editorError={props.editorError}
      encodingMode={props.encodingMode}
      languages={props.languages}
      missingFields={props.missingFields}
      saveCurrentTemplate={props.saveCurrentTemplate}
      setEncodingMode={props.setEncodingMode}
      setTemplateValue={props.setTemplateValue}
      setAllTemplateValues={props.setAllTemplateValues}
      setMaterialization={props.setMaterialization}
      setWidgetValue={props.setWidgetValue}
      spec={props.spec as Json}
      switchView={props.switchView}
      template={props.template}
      templateComplete={props.templateComplete}
      templateMap={props.templateMap}
      templates={props.templates}
      views={props.views}
      width={props.width}
    />
  );
}

export function mapStateToProps({base, data}: {base: AppState; data: DataReducerState}): any {
  const template = base.currentTemplateInstance;
  const templateMap = base.templateMap;
  const missingFields = (template && getMissingFields(template, templateMap)) || [];
  const spec = evaluateIvyProgram(template, templateMap);
  return {
    columns: base.columns,
    currentView: base.currentView,
    currentlySelectedFile: base.currentlySelectedFile,
    data: data.data,
    editorError: base.editorError,
    // i think encoding mode might not be necessary
    encodingMode: base.encodingMode,
    missingFields,
    spec,
    template,
    templateComplete: !missingFields.length,
    templateMap,
    templates: base.templates,
    views: base.views,
    viewCatalog: base.viewCatalog,
  };
}

export default connect(mapStateToProps, actionCreators)(ChartAreaWrapper);
