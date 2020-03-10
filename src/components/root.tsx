import React from 'react';
import {connect} from 'react-redux';

import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';
import {GlobalHotKeys} from 'react-hotkeys';
import GALLERY from '../templates/gallery';
import {getUserName} from '../utils/local-storage';

import {HOT_KEYS} from '../constants/index';
import * as actionCreators from '../actions/index';
// import {Filter} from '../actions/index';
import {
  CoerceTypePayload,
  GenericAction,
  HandleCodePayload,
  LoadDataPayload,
  ModifyValueOnTemplatePayload,
  MoveWidgetPayload,
  SetTemplateValuePayload,
  SetWidgetValuePayload,
  UpdateFilterPayload,
  DataRow,
} from '../actions/index';
import {getTemplateSaveState, computeValidAddNexts, classnames} from '../utils';
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
import {
  AppState,
  ColumnHeader,
  DataReducerState,
  GenWidget,
  HydraExtension,
  Json,
  Template,
  TemplateMap,
  ViewsToMaterialize,
} from '../types';

import ChartArea from './chart-area';
import CodeEditor from './code-editor';
import DataColumn from './data-column';
import DataModal from './modals/data-modal';
import CommunityProgramSearch from './modals/community-modal';
import EncodingControls from './encoding-controls';
import Header from './header';
import ImportDataColumn from './import-data-column';
import EncodingColumn from './encoding-column';
import RelatedViews from './related-views';

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
  currentView: string;
  currentlySelectedFile: string;
  data: DataRow[];
  editMode: boolean;
  editorError: null | string;
  encodingMode: string;
  fillableFields: Set<string>;
  languages: {[x: string]: HydraExtension};
  missingFields: string[];
  openModal: string | null;
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  spec: Spec;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templateSaveState: string;
  templates: Template[];
  userName: string;
  views: string[];

  addToNextOpenSlot: GenericAction<ColumnHeader>;
  addWidget: GenericAction<GenWidget>;
  chainActions: GenericAction<any>;
  changeSelectedFile: GenericAction<string>;
  changeViewName: GenericAction<{idx: number; value: string}>;
  cloneView: GenericAction<void>;
  coerceType: GenericAction<CoerceTypePayload>;
  createFilter: GenericAction<ColumnHeader>;
  createNewView: GenericAction<void>;
  deleteFilter: GenericAction<number>;
  deleteTemplate: GenericAction<string>;
  deleteView: GenericAction<string>;
  duplicateWidget: GenericAction<number>;
  fillTemplateMapWithDefaults: GenericAction<void>;
  loadCustomDataset: GenericAction<LoadDataPayload>;
  loadDataFromPredefinedDatasets: GenericAction<string>;
  loadExternalTemplate: GenericAction<Template>;
  loadTemplates: GenericAction<void>;
  modifyValueOnTemplate: GenericAction<ModifyValueOnTemplatePayload>;
  moveWidget: GenericAction<MoveWidgetPayload>;
  readInTemplate: GenericAction<HandleCodePayload>;
  readInTemplateMap: GenericAction<HandleCodePayload>;
  recieveLanguages: GenericAction<{[x: string]: HydraExtension}>;
  removeWidget: GenericAction<number>;
  saveCurrentTemplate: GenericAction<void>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setBlankTemplate: GenericAction<{fork: string | null; language: string}>;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  setEncodingMode: GenericAction<string>;
  setGuiView: GenericAction<boolean>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setModalState: GenericAction<string | null>;
  setNewSpecCode: GenericAction<HandleCodePayload>;
  setProgrammaticView: GenericAction<boolean>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setUserName: GenericAction<string>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  switchView: GenericAction<string>;
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
    // this.createFilter = this.createFilter.bind(this);
    this.triggerRepaint = this.triggerRepaint.bind(this);
    this.state = {repaintIdx: 0};
  }
  componentDidMount(): void {
    this.props.loadDataFromPredefinedDatasets(this.props.currentlySelectedFile);
    this.props.loadTemplates();
    this.props.fillTemplateMapWithDefaults();
    this.props.setUserName(getUserName());
    this.props.recieveLanguages(this.props.languages);
  }

  componentDidCatch(error: any, errorInfo: any): void {
    console.error('ERRPR', error, errorInfo);
  }

  triggerRepaint(): void {
    this.setState({repaintIdx: this.state.repaintIdx + 1});
  }

  chartArea(): JSX.Element {
    return (
      <ChartArea
        changeViewName={this.props.changeViewName}
        cloneView={this.props.cloneView}
        columns={this.props.columns}
        createNewView={this.props.createNewView}
        currentView={this.props.currentView}
        data={this.props.data}
        deleteTemplate={this.props.deleteTemplate}
        deleteView={this.props.deleteView}
        encodingMode={this.props.encodingMode}
        languages={this.props.languages}
        missingFields={this.props.missingFields}
        setEncodingMode={this.props.setEncodingMode}
        setTemplateValue={this.props.setTemplateValue}
        setAllTemplateValues={this.props.setAllTemplateValues}
        setMaterialization={this.props.setMaterialization}
        spec={this.props.spec as Json}
        switchView={this.props.switchView}
        template={this.props.template}
        templateComplete={this.props.templateComplete}
        templateMap={this.props.templateMap}
        templates={this.props.templates}
        views={this.props.views}
        userName={this.props.userName}
      />
    );
  }

  leftColumn(): JSX.Element {
    const {columns, createFilter} = this.props;
    return (
      <div className="flex-down full-height column background-2">
        <ImportDataColumn
          currentlySelectedFile={this.props.currentlySelectedFile}
          setModalState={this.props.setModalState}
        />
        <DataColumn
          addToNextOpenSlot={this.props.addToNextOpenSlot}
          coerceType={this.props.coerceType}
          columns={columns}
          createFilter={createFilter}
          deleteFilter={this.props.deleteFilter}
          fillableFields={this.props.fillableFields}
          onDropFilter={(item: any): any => createFilter(columns.find(d => d.field === item.text))}
          showGUIView={this.props.showGUIView}
          template={this.props.template}
          templateMap={this.props.templateMap}
          updateFilter={this.props.updateFilter}
        />
        <RelatedViews
          columns={columns}
          setEncodingMode={this.props.setEncodingMode}
          template={this.props.template}
          templateMap={this.props.templateMap}
          templates={this.props.templates}
        />
      </div>
    );
  }

  centerColumn(): JSX.Element {
    return (
      <div className="full-height full-width flex-down" style={{minWidth: '360px'}}>
        <EncodingControls
          chainActions={this.props.chainActions}
          deleteTemplate={this.props.deleteTemplate}
          editMode={this.props.editMode}
          encodingMode={this.props.encodingMode}
          fillTemplateMapWithDefaults={this.props.fillTemplateMapWithDefaults}
          languages={this.props.languages}
          modifyValueOnTemplate={this.props.modifyValueOnTemplate}
          saveCurrentTemplate={this.props.saveCurrentTemplate}
          setBlankTemplate={this.props.setBlankTemplate}
          setCodeMode={this.props.setCodeMode}
          setEditMode={this.props.setEditMode}
          setProgrammaticView={this.props.setProgrammaticView}
          template={this.props.template}
          templateSaveState={this.props.templateSaveState}
          templates={this.props.templates}
        />

        <EncodingColumn
          addWidget={this.props.addWidget}
          columns={this.props.columns}
          duplicateWidget={this.props.duplicateWidget}
          editMode={this.props.editMode}
          height={this.props.showProgrammaticMode && this.props.showGUIView && getHeight()}
          languages={this.props.languages}
          modifyValueOnTemplate={this.props.modifyValueOnTemplate}
          moveWidget={this.props.moveWidget}
          removeWidget={this.props.removeWidget}
          setAllTemplateValues={this.props.setAllTemplateValues}
          setTemplateValue={this.props.setTemplateValue}
          setMaterialization={this.props.setMaterialization}
          setWidgetValue={this.props.setWidgetValue}
          template={this.props.template}
          templateMap={this.props.templateMap}
        />
      </div>
    );
  }

  codeEditor(): JSX.Element {
    return (
      <CodeEditor
        addWidget={this.props.addWidget}
        codeMode={this.props.codeMode}
        columns={this.props.columns}
        chainActions={this.props.chainActions}
        currentView={this.props.currentView}
        editMode={this.props.editMode}
        editorLineWrap={getEditorLineWrap()}
        editorError={this.props.editorError}
        editorFontSize={getEditorFontSize()}
        languages={this.props.languages}
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
        setAllTemplateValues={this.props.setAllTemplateValues}
        setProgrammaticView={this.props.setProgrammaticView}
        showProgrammaticMode={this.props.showProgrammaticMode}
        spec={this.props.spec}
        template={this.props.template}
        templateMap={this.props.templateMap}
      />
    );
  }

  hotKeyProvider(): JSX.Element {
    const {
      canRedo,
      canUndo,
      editMode,
      fillTemplateMapWithDefaults,
      openModal,
      setEditMode,
      setEncodingMode,
      setModalState,
      template,
      triggerRedo,
      triggerUndo,
    } = this.props;
    const onGallery = template.templateName === GALLERY.templateName;
    const withSay = (func: any, name: string) => (): any => {
      console.log('hotkey', name);
      func();
    };
    return (
      <GlobalHotKeys
        keyMap={HOT_KEYS}
        handlers={{
          TOGGLE_EDIT: withSay(() => !onGallery && setEditMode(!editMode), 'edit'),
          CLEAR_ENCODING: withSay(() => fillTemplateMapWithDefaults(), 'clear'),
          HOME: withSay(() => setEncodingMode(GALLERY.templateName), 'home'),
          UNDO: withSay(() => canUndo && triggerUndo(), 'undo'),
          REDO: withSay(() => canRedo && triggerRedo(), 'redo'),
          CLOSE_MODALS: withSay(() => {
            if (openModal) {
              setModalState(null);
            }
          }, 'close modals'),
        }}
        allowChanges={true}
      />
    );
  }

  render(): JSX.Element {
    const {showProgrammaticMode} = this.props;
    return (
      <div className="flex-down full-width full-height">
        {this.hotKeyProvider()}
        {this.props.openModal === 'data' && (
          <DataModal
            chainActions={this.props.chainActions}
            changeSelectedFile={this.props.changeSelectedFile}
            loadCustomDataset={this.props.loadCustomDataset}
            setModalState={this.props.setModalState}
            setEncodingMode={this.props.setEncodingMode}
          />
        )}
        {this.props.openModal === 'community' && (
          <CommunityProgramSearch
            triggerRepaint={this.triggerRepaint}
            loadExternalTemplate={this.props.loadExternalTemplate}
            setModalState={this.props.setModalState}
            templates={this.props.templates}
            userName={this.props.userName}
          />
        )}
        <Header
          canRedo={this.props.canRedo}
          canUndo={this.props.canUndo}
          triggerRedo={this.props.triggerRedo}
          triggerUndo={this.props.triggerUndo}
          setEncodingMode={this.props.setEncodingMode}
          setModalState={this.props.setModalState}
          encodingMode={this.props.encodingMode}
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
              <Wrapper showProgrammaticMode={showProgrammaticMode} showGUIView={true}>
                <div
                  className={classnames({
                    flex: true,
                    'full-height': true,
                    'full-width': true,
                    'special-bump-for-closed-code-container': !showProgrammaticMode,
                  })}
                >
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
  const isGallery = GALLERY.templateName === template.templateName;
  const spec = evaluateHydraProgram(template, templateMap);
  return {
    canRedo: base.redoStack.length >= 1,
    canUndo: base.undoStack.length >= 1,
    codeMode: base.codeMode,
    columns: base.columns,
    currentView: base.currentView,
    currentlySelectedFile: base.currentlySelectedFile,
    data: data.data,
    editMode: isGallery ? false : base.editMode,
    editorError: base.editorError,
    encodingMode: base.encodingMode,
    fillableFields: computeValidAddNexts(template, templateMap),
    missingFields,
    openModal: base.openModal,
    showProgrammaticMode: isGallery ? false : base.showProgrammaticMode,
    showGUIView: base.showGUIView,
    spec,
    template,
    templateComplete: !missingFields.length,
    templateMap,
    templateSaveState: getTemplateSaveState(base),
    templates: base.templates,
    userName: base.userName,
    views: base.views,
  };
}

export default connect(mapStateToProps, actionCreators)(RootComponent);
