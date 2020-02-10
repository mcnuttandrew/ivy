import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';
import {GlobalHotKeys} from 'react-hotkeys';

import {Template, TemplateMap, TemplateWidget, WidgetSubType} from '../templates/types';
import {thumbnailLocation} from '../utils/thumbnail';

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
import {getUniques, getDomain, getTemplateSaveState, getTemplateName, computeValidAddNexts} from '../utils';
import {
  getHeight,
  writeHeight,
  getWidth,
  writeWidth,
  getEditorFontSize,
  writeEditorFontSize,
  getEditorLineWrap,
  writeEditorLineWrap,
} from '../utils/local-storage';
import {evaluateHydraProgram, getMissingFields} from '../hydra-lang';

import {Spec} from 'vega-typings';
import {ColumnHeader, VegaTheme, Json} from '../types';
import {AppState, DataReducerState} from '../reducers/default-state';

import ChartArea from './chart-area';
import CodeEditor from './code-editor';
import DataColumn from './data-column';
import DataModal from './modals/data-modal';
import CommunityProgramSearch from './modals/community-modal';
import EncodingColumn from './t0/encoding-column';
import EncodingControls from './encoding-controls';
import Header from './header';
import ImportDataColumn from './import-data-column';
import TemplateColumn from './template-column';

// wrap the split pane functionality into a HOC
const Wrapper = (props: any): JSX.Element => {
  if (props.showProgrammaticMode && props.showGUIView) {
    return (
      <SplitPane
        split="horizontal"
        minSize={60}
        style={{overflow: 'unset', position: 'relative'}}
        defaultSize={getHeight() || 400}
        onChange={writeHeight}
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
  changeTheme: GenericAction<string>;
  changeViewName: GenericAction<{idx: number; value: string}>;
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
  setAllTemplateValues: GenericAction<TemplateMap>;
  setBlankTemplate: GenericAction<boolean>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
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
interface State {
  // a mechanism to kick the component into a repaint
  repaintIdx: number;
}

class RootComponent extends React.Component<RootProps, State> {
  constructor(props: RootProps) {
    super(props);
    this.createFilter = this.createFilter.bind(this);
    this.state = {repaintIdx: 0};
    this.triggerRepaint = this.triggerRepaint.bind(this);
  }
  componentDidMount(): void {
    this.props.loadDataFromPredefinedDatasets(this.props.currentlySelectedFile);
    this.props.loadTemplates();
    this.props.prepareTemplate();
  }

  componentDidCatch(error: any, errorInfo: any): void {
    console.error('ERRPR', error, errorInfo);
  }

  triggerRepaint(): void {
    this.setState({repaintIdx: this.state.repaintIdx + 1});
  }

  createFilter(field: string): void {
    // this biz-logic function is here in order to move the data off of the immutable reducer
    const {columns, createFilter, data} = this.props;
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
        changeViewName={this.props.changeViewName}
        cloneView={this.props.cloneView}
        columns={this.props.columns}
        createNewView={this.props.createNewView}
        currentTheme={this.props.currentTheme}
        currentView={this.props.currentView}
        data={this.props.data}
        deleteView={this.props.deleteView}
        deleteTemplate={this.props.deleteTemplate}
        encodingMode={this.props.encodingMode}
        missingFields={this.props.missingFields}
        setEncodingMode={this.props.setEncodingMode}
        spec={this.props.spec as Json}
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
    const {template} = this.props;
    return (
      <div className="flex-down full-height column background-2">
        <div className="template-logo">
          <img src={thumbnailLocation(template && template.templateName)} />
          <div>
            <h5>Currently template</h5>
            <h4>{getTemplateName(template)}</h4>
          </div>
        </div>
        <ImportDataColumn
          currentlySelectedFile={this.props.currentlySelectedFile}
          toggleDataModal={this.props.toggleDataModal}
        />
        <DataColumn
          addToNextOpenSlot={this.props.addToNextOpenSlot}
          coerceType={this.props.coerceType}
          columns={this.props.columns}
          createFilter={this.createFilter}
          deleteFilter={this.props.deleteFilter}
          fillableFields={this.props.fillableFields}
          metaColumns={this.props.metaColumns}
          onDropFilter={(item: any): any => this.createFilter(item.text)}
          setRepeats={this.props.setRepeats}
          showGUIView={this.props.showGUIView}
          spec={this.props.spec}
          template={template}
          updateFilter={this.props.updateFilter}
        />
      </div>
    );
  }

  centerColumn(): JSX.Element {
    return (
      <div className=" full-height full-width flex-down" style={{minWidth: '360px'}}>
        <EncodingControls
          chainActions={this.props.chainActions}
          clearEncoding={this.props.clearEncoding}
          deleteTemplate={this.props.deleteTemplate}
          editMode={this.props.editMode}
          encodingMode={this.props.encodingMode}
          modifyValueOnTemplate={this.props.modifyValueOnTemplate}
          saveCurrentTemplate={this.props.saveCurrentTemplate}
          setBlankTemplate={this.props.setBlankTemplate}
          setCodeMode={this.props.setCodeMode}
          setEditMode={this.props.setEditMode}
          setEncodingMode={this.props.setEncodingMode}
          template={this.props.template}
          templateSaveState={this.props.templateSaveState}
          templates={this.props.templates}
          toggleProgramModal={this.props.toggleProgramModal}
        />
        {this.props.encodingMode === 'grammer' && this.props.showGUIView && (
          <EncodingColumn
            changeMarkType={this.props.changeMarkType}
            columns={this.props.columns}
            metaColumns={this.props.metaColumns}
            onDrop={(item: any): void => {
              if (item.disable) {
                return;
              }
              this.props.setEncodingParameter(item);
            }}
            onDropFilter={(item: any): any => this.createFilter(item.text)}
            setEncodingParameter={this.props.setEncodingParameter}
            setNewSpec={this.props.setNewSpec}
            spec={this.props.spec}
            swapXAndYChannels={this.props.swapXAndYChannels}
          />
        )}
        {this.props.encodingMode !== 'grammer' && this.props.template && this.props.showGUIView && (
          <TemplateColumn
            addWidget={this.props.addWidget}
            columns={this.props.columns}
            editMode={this.props.editMode}
            height={this.props.showProgrammaticMode && this.props.showGUIView && getHeight()}
            moveWidget={this.props.moveWidget}
            modifyValueOnTemplate={this.props.modifyValueOnTemplate}
            removeWidget={this.props.removeWidget}
            setTemplateValue={this.props.setTemplateValue}
            setWidgetValue={this.props.setWidgetValue}
            setAllTemplateValues={this.props.setAllTemplateValues}
            template={this.props.template}
            templateMap={this.props.templateMap}
          />
        )}
      </div>
    );
  }

  codeEditor(): JSX.Element {
    return (
      <CodeEditor
        addWidget={this.props.addWidget}
        codeMode={this.props.codeMode}
        chainActions={this.props.chainActions}
        currentView={this.props.currentView}
        editMode={this.props.editMode}
        editorLineWrap={getEditorLineWrap()}
        editorError={this.props.editorError}
        editorFontSize={getEditorFontSize()}
        readInTemplate={this.props.readInTemplate}
        readInTemplateMap={this.props.readInTemplateMap}
        setCodeMode={this.props.setCodeMode}
        setEditMode={this.props.setEditMode}
        setNewSpecCode={this.props.setNewSpecCode}
        setEditorFontSize={(size: number): void => {
          writeEditorFontSize(size);
          this.triggerRepaint();
        }}
        setEditorLineWrap={(value: boolean): void => {
          writeEditorLineWrap(value);
          this.triggerRepaint();
        }}
        setProgrammaticView={this.props.setProgrammaticView}
        showProgrammaticMode={this.props.showProgrammaticMode}
        spec={this.props.spec}
        specCode={this.props.specCode}
        template={this.props.template}
        templateMap={this.props.templateMap}
      />
    );
  }

  hotKeyProvider(): JSX.Element {
    const {
      canUndo,
      triggerUndo,
      canRedo,
      triggerRedo,
      dataModalOpen,
      programModalOpen,
      toggleProgramModal,
      toggleDataModal,
    } = this.props;

    return (
      <GlobalHotKeys
        keyMap={{
          UNDO: 'command+z',
          REDO: 'command+shift+z',
          CLOSE_MODALS: 'Escape',
        }}
        handlers={{
          UNDO: (): any => canUndo && triggerUndo(),
          REDO: (e): any => {
            console.log(e);
            canRedo && triggerRedo();
          },

          CLOSE_MODALS: (): any => {
            if (dataModalOpen) {
              toggleDataModal();
            }
            if (programModalOpen) {
              toggleProgramModal();
            }
          },
        }}
        allowChanges={true}
      />
    );
  }

  render(): JSX.Element {
    return (
      <div className="flex-down full-width full-height">
        {this.hotKeyProvider()}
        {this.props.dataModalOpen && (
          <DataModal
            chainActions={this.props.chainActions}
            changeSelectedFile={this.props.changeSelectedFile}
            loadCustomDataset={this.props.loadCustomDataset}
            toggleDataModal={this.props.toggleDataModal}
          />
        )}
        {this.props.programModalOpen && (
          <CommunityProgramSearch
            triggerRepaint={this.triggerRepaint}
            loadExternalTemplate={this.props.loadExternalTemplate}
            toggleProgramModal={this.props.toggleProgramModal}
            templates={this.props.templates}
          />
        )}
        <Header
          canRedo={this.props.canRedo}
          canUndo={this.props.canUndo}
          triggerRedo={this.props.triggerRedo}
          triggerUndo={this.props.triggerUndo}
        />
        <div className="flex main-content-container relative">
          <DndProvider backend={HTML5Backend}>
            <SplitPane
              split="vertical"
              minSize={610}
              style={{overflow: 'unset', position: 'relative'}}
              defaultSize={getWidth() || 610}
              onChange={writeWidth}
            >
              <Wrapper showProgrammaticMode={this.props.showProgrammaticMode} showGUIView={true}>
                <div className="flex full-height full-width">
                  {this.leftColumn()}
                  {this.centerColumn()}
                </div>
                {this.codeEditor()}
              </Wrapper>
              {this.chartArea()}
            </SplitPane>
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
