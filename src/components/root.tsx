import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';

import {Template, TemplateMap, TemplateWidget, WidgetSubType} from '../templates/types';

import {SHOW_TEMPLATE_CONTROLS} from '../constants/CONFIG';

import * as actionCreators from '../actions/index';
import {Filter} from '../actions/index';
import {
  CoerceTypePayload,
  GenericAction,
  HandleCodePayload,
  LoadDataPayload,
  ModifyValueOnTemplatePayload,
  MoveWidgetPayload,
  SetRepeatsPayload,
  SetTemplateValuePayload,
  SetWidgetValuePayload,
  UpdateFilterPayload,
  DataRow,
} from '../actions/index';
import {getUniques, getDomain, getTemplateSaveState, classnames, computeValidAddNexts} from '../utils';
import {evaluateHydraProgram, getMissingFields} from '../hydra-lang';

import {Spec} from 'vega-typings';
import {ColumnHeader, VegaTheme} from '../types';
import {AppState, DataReducerState} from '../reducers/default-state';

import ChartArea from './chart-area';
import CodeEditor from './code-editor';
import DataColumn from './data-column';
import DataModal from './data-modal';
import ProgramModal from './program-search/program-modal';
import EncodingColumn from './encoding-column';
import EncodingControls from './encoding-controls';
import Header from './header';
import ImportDataColumn from './import-data-column';
import TemplateColumn from './template-column';
import TemplatePreviewColumn from './template-preview-column';

// wrap the split pane functionality into a HOC
const getHeight = (): number => Number(localStorage.getItem('splitPos'));
const Wrapper = (props: any): JSX.Element => {
  if (props.showProgrammaticMode && props.showGUIView) {
    return (
      <SplitPane
        split="horizontal"
        minSize={60}
        style={{overflow: 'unset', position: 'relative'}}
        defaultSize={getHeight()}
        onChange={(size: any): any => localStorage.setItem('splitPos', size)}
      >
        {props.children}
      </SplitPane>
    );
  }

  return <div className="flex-down full-height">{props.children}</div>;
};

interface RootProps {
  canRedo: boolean;
  canUndo: boolean;
  codeMode: string;
  columns: ColumnHeader[];
  currentTheme: VegaTheme;
  currentView: string;
  currentlySelectedFile: string;
  data: DataRow[];
  dataModalOpen: boolean;
  editMode: boolean;
  editorError: null | string;
  editorFontSize: number;
  encodingMode: string;
  fillableFields: Set<string>;
  metaColumns: ColumnHeader[];
  missingFields: string[];
  programModalOpen: boolean;
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  spec: Spec;
  specCode: string;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templateSaveState: string;
  templates: Template[];
  views: string[];

  addToNextOpenSlot: GenericAction<ColumnHeader>;
  addWidget: GenericAction<TemplateWidget<WidgetSubType>>;
  chainActions: GenericAction<any>;
  changeMarkType: GenericAction<string>;
  changeSelectedFile: GenericAction<string>;
  changeViewName: GenericAction<{idx: number; value: string}>;
  changeTheme: GenericAction<string>;
  clearEncoding: GenericAction<void>;
  cloneView: GenericAction<void>;
  coerceType: GenericAction<CoerceTypePayload>;
  createFilter: GenericAction<Filter>;
  createNewView: GenericAction<void>;
  deleteFilter: GenericAction<number>;
  deleteTemplate: GenericAction<string>;
  deleteView: GenericAction<string>;
  loadCustomDataset: GenericAction<LoadDataPayload>;
  loadDataFromPredefinedDatasets: GenericAction<string>;
  loadExternalTemplate: GenericAction<Template>;
  loadTemplates: GenericAction<void>;
  modifyValueOnTemplate: GenericAction<ModifyValueOnTemplatePayload>;
  moveWidget: GenericAction<MoveWidgetPayload>;
  prepareTemplate: GenericAction<void>;
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  removeWidget: GenericAction<number>;
  saveCurrentTemplate: GenericAction<void>;
  setBlankTemplate: GenericAction<boolean>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setEditorFontSize: GenericAction<number>;
  setEncodingMode: GenericAction<string>;
  setEncodingParameter: GenericAction<SetTemplateValuePayload>;
  setGuiView: GenericAction<boolean>;
  setNewSpec: GenericAction<any>;
  setNewSpecCode: GenericAction<HandleCodePayload>;
  setProgrammaticView: GenericAction<void>;
  setRepeats: GenericAction<SetRepeatsPayload>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  swapXAndYChannels: GenericAction<void>;
  switchView: GenericAction<string>;
  toggleDataModal: GenericAction<void>;
  toggleProgramModal: GenericAction<void>;
  triggerRedo: GenericAction<void>;
  triggerUndo: GenericAction<void>;
  updateFilter: GenericAction<UpdateFilterPayload>;
}

class RootComponent extends React.Component<RootProps> {
  constructor(props: RootProps) {
    super(props);
    this.createFilter = this.createFilter.bind(this);
  }
  componentDidMount(): void {
    this.props.loadDataFromPredefinedDatasets(this.props.currentlySelectedFile);
    this.props.loadTemplates();
    this.props.prepareTemplate();
  }

  componentDidCatch(error: any, errorInfo: any): void {
    console.error('ERRPR', error, errorInfo);
  }

  createFilter(field: string): void {
    const {columns, createFilter, data} = this.props;
    // const isDim = findField(state, payload.field).type === 'DIMENSION';
    const isDim = columns.find(x => x.field === field).type === 'DIMENSION';
    const newFilter: Filter = {
      filter: {
        field: field,
        // todo this is really slick, but we should probably be caching these values on load
        [isDim ? 'oneOf' : 'range']: (isDim ? getUniques : getDomain)(data, field),
      },
    };
    createFilter(newFilter);
  }

  chartArea(): JSX.Element {
    return (
      <ChartArea
        chainActions={this.props.chainActions}
        changeViewName={this.props.changeViewName}
        clearEncoding={this.props.clearEncoding}
        cloneView={this.props.cloneView}
        columns={this.props.columns}
        createNewView={this.props.createNewView}
        currentTheme={this.props.currentTheme}
        currentView={this.props.currentView}
        data={this.props.data}
        deleteView={this.props.deleteView}
        encodingMode={this.props.encodingMode}
        missingFields={this.props.missingFields}
        setEncodingMode={this.props.setEncodingMode}
        spec={this.props.spec}
        switchView={this.props.switchView}
        template={this.props.template}
        templateComplete={this.props.templateComplete}
        templateMap={this.props.templateMap}
        templates={this.props.templates}
        views={this.props.views}
      />
    );
  }

  leftColumn(): JSX.Element {
    const {
      addToNextOpenSlot,
      coerceType,
      columns,
      currentlySelectedFile,
      deleteFilter,
      fillableFields,
      metaColumns,
      setRepeats,
      showGUIView,
      spec,
      template,
      toggleDataModal,
      updateFilter,
    } = this.props;
    return (
      <div className="flex-down full-height column background-2">
        <ImportDataColumn currentlySelectedFile={currentlySelectedFile} toggleDataModal={toggleDataModal} />
        <DataColumn
          addToNextOpenSlot={addToNextOpenSlot}
          coerceType={coerceType}
          columns={columns}
          createFilter={this.createFilter}
          deleteFilter={deleteFilter}
          fillableFields={fillableFields}
          metaColumns={metaColumns}
          onDropFilter={(item: any): any => this.createFilter(item.text)}
          setRepeats={setRepeats}
          showGUIView={showGUIView}
          spec={spec}
          template={template}
          updateFilter={updateFilter}
        />
      </div>
    );
  }

  centerColumn(): JSX.Element {
    const {
      addWidget,
      chainActions,
      changeMarkType,
      clearEncoding,
      columns,
      deleteTemplate,
      editMode,
      encodingMode,
      metaColumns,
      modifyValueOnTemplate,
      moveWidget,
      removeWidget,
      saveCurrentTemplate,
      setAllTemplateValues,
      setBlankTemplate,
      setCodeMode,
      setEditMode,
      setEncodingMode,
      setEncodingParameter,
      setNewSpec,
      showProgrammaticMode,
      setTemplateValue,
      setWidgetValue,
      showGUIView,
      spec,
      swapXAndYChannels,
      template,
      templateMap,
      templateSaveState,
      templates,
    } = this.props;

    return (
      <div className=" full-height full-width flex-down" style={{minWidth: '360px'}}>
        {SHOW_TEMPLATE_CONTROLS && (
          <EncodingControls
            chainActions={chainActions}
            clearEncoding={clearEncoding}
            deleteTemplate={deleteTemplate}
            editMode={editMode}
            encodingMode={encodingMode}
            modifyValueOnTemplate={modifyValueOnTemplate}
            saveCurrentTemplate={saveCurrentTemplate}
            setBlankTemplate={setBlankTemplate}
            setCodeMode={setCodeMode}
            setEditMode={setEditMode}
            setEncodingMode={setEncodingMode}
            template={template}
            templateSaveState={templateSaveState}
            templates={templates}
          />
        )}
        {encodingMode === 'grammer' && showGUIView && (
          <EncodingColumn
            changeMarkType={changeMarkType}
            columns={columns}
            metaColumns={metaColumns}
            onDrop={(item: any): void => {
              if (item.disable) {
                return;
              }
              setEncodingParameter(item);
            }}
            onDropFilter={(item: any): any => this.createFilter(item.text)}
            setEncodingParameter={setEncodingParameter}
            setNewSpec={setNewSpec}
            spec={spec}
            swapXAndYChannels={swapXAndYChannels}
          />
        )}
        {encodingMode !== 'grammer' && template && showGUIView && (
          <TemplateColumn
            addWidget={addWidget}
            columns={columns}
            editMode={editMode}
            height={showProgrammaticMode && showGUIView && getHeight()}
            moveWidget={moveWidget}
            modifyValueOnTemplate={modifyValueOnTemplate}
            removeWidget={removeWidget}
            setTemplateValue={setTemplateValue}
            setWidgetValue={setWidgetValue}
            setAllTemplateValues={setAllTemplateValues}
            template={template}
            templateMap={templateMap}
          />
        )}
      </div>
    );
  }

  codeEditor(): JSX.Element {
    const {
      addWidget,
      codeMode,
      chainActions,
      editMode,
      editorError,
      editorFontSize,
      readInTemplate,
      readInTemplateMap,
      setCodeMode,
      setEditMode,
      setEditorFontSize,
      setNewSpecCode,
      setProgrammaticView,
      showProgrammaticMode,
      spec,
      specCode,
      template,
      templateMap,
    } = this.props;
    return (
      <div
        className={classnames({
          'full-width': true,
          'flex-down': true,
          'full-height': showProgrammaticMode,
        })}
      >
        <CodeEditor
          addWidget={addWidget}
          codeMode={codeMode}
          chainActions={chainActions}
          editMode={editMode}
          editorError={editorError}
          editorFontSize={editorFontSize}
          readInTemplate={readInTemplate}
          readInTemplateMap={readInTemplateMap}
          setCodeMode={setCodeMode}
          setEditMode={setEditMode}
          setEditorFontSize={setEditorFontSize}
          setNewSpecCode={setNewSpecCode}
          setProgrammaticView={setProgrammaticView}
          showProgrammaticMode={showProgrammaticMode}
          spec={spec}
          specCode={specCode}
          template={template}
          templateMap={templateMap}
        />
      </div>
    );
  }

  render(): JSX.Element {
    const {
      canRedo,
      canUndo,
      chainActions,
      changeSelectedFile,
      dataModalOpen,
      deleteTemplate,
      encodingMode,
      loadCustomDataset,
      loadExternalTemplate,
      programModalOpen,
      toggleDataModal,
      toggleProgramModal,
      triggerRedo,
      triggerUndo,
      showProgrammaticMode,
      setEncodingMode,
      templates,
    } = this.props;

    return (
      <div className="flex-down full-width full-height">
        {dataModalOpen && (
          <DataModal
            chainActions={chainActions}
            changeSelectedFile={changeSelectedFile}
            loadCustomDataset={loadCustomDataset}
            toggleDataModal={toggleDataModal}
          />
        )}
        {programModalOpen && (
          <ProgramModal
            chainActions={chainActions}
            deleteTemplate={deleteTemplate}
            loadExternalTemplate={loadExternalTemplate}
            setEncodingMode={setEncodingMode}
            templates={templates}
            toggleProgramModal={toggleProgramModal}
          />
        )}
        <Header canRedo={canRedo} canUndo={canUndo} triggerRedo={triggerRedo} triggerUndo={triggerUndo} />
        <div className="flex full-height relative">
          <DndProvider backend={HTML5Backend}>
            <Wrapper showProgrammaticMode={showProgrammaticMode} showGUIView={true}>
              <div className="flex-down full-height">
                <TemplatePreviewColumn
                  encodingMode={encodingMode}
                  setEncodingMode={setEncodingMode}
                  templates={templates}
                  toggleProgramModal={toggleProgramModal}
                />
                <div className="flex" style={{height: 'calc(100% - 77px)'}}>
                  {this.leftColumn()}
                  {this.centerColumn()}
                </div>
              </div>
              {this.codeEditor()}
            </Wrapper>
            {this.chartArea()}
          </DndProvider>
        </div>
      </div>
    );
  }
}

export function mapStateToProps({base, data}: {base: AppState; data: DataReducerState}): any {
  const template = base.currentTemplateInstance;
  const templateMap = base.templateMap;
  const missingFields = (template && getMissingFields(template, templateMap)) || [];
  return {
    canRedo: base.redoStack.length >= 1,
    canUndo: base.undoStack.length >= 1,
    codeMode: base.codeMode,
    columns: base.columns,
    currentTheme: base.currentTheme,
    currentView: base.currentView,
    currentlySelectedFile: base.currentlySelectedFile,
    data: data.data,
    dataModalOpen: base.dataModalOpen,
    editMode: base.editMode,
    editorError: base.editorError,
    editorFontSize: base.editorFontSize,
    encodingMode: base.encodingMode,
    fillableFields: computeValidAddNexts(template, templateMap),
    metaColumns: base.metaColumns,
    missingFields,
    programModalOpen: base.programModalOpen,
    showProgrammaticMode: base.showProgrammaticMode,
    showGUIView: base.showGUIView,
    spec: template ? evaluateHydraProgram(template, templateMap) : base.spec,
    specCode: base.specCode,
    template,
    templateComplete: !missingFields.length,
    templateMap,
    templateSaveState: getTemplateSaveState(base),
    templates: base.templates,
    views: base.views,
  };
}

export default connect(mapStateToProps, actionCreators)(RootComponent);
