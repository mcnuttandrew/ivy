import {List} from 'immutable';
import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {getMissingFields} from '../reducers/template-actions';
import {Template, TemplateMap} from '../templates/types';

import {
  SHOW_SECONDARY_CONTROLS,
  SHOW_TEMPLATE_CONTROLS,
} from '../constants/CONFIG';

import * as actionCreators from '../actions/index';
import {GenericAction} from '../actions/index';
import {getTemplateSaveState} from '../utils';

import {Spec} from 'vega-typings';
import {ColumnHeader, VegaTheme} from '../types';
import {AppState} from '../reducers/default-state';

import CodeEditor from './code-editor';

import Header from './header';
import DataColumn from './data-column';
import ChartArea from './chart-area';
import EncodingColumn from './encoding-column';
import DataModal from './data-modal';
import SecondaryControls from './secondary-controls';
import TemplateColumn from './template-column';

import EncodingControls from './encoding-controls';

// TODO root props shouldn't all be optional, fix
interface RootProps {
  columns?: ColumnHeader[];
  canUndo?: boolean;
  canRedo?: boolean;
  codeMode?: string;
  editorError?: null | string;
  editMode?: boolean;
  spec?: Spec;
  specCode?: string;
  data?: any; //TODO: define the data type
  encodingMode?: string;
  GOOSE_MODE?: boolean;
  iMspec?: any;
  metaColumns?: ColumnHeader[];
  currentlySelectedFile?: string;
  currentTheme?: VegaTheme;
  dataModalOpen?: boolean;
  missingFields?: string[];
  showProgrammaticMode?: boolean;
  template?: Template;
  templates?: Template[];
  templateSaveState?: string;
  templateMap?: TemplateMap;
  templateComplete?: boolean;
  currentView?: string;
  views?: List<string>;

  createNewView?: GenericAction;
  deleteView?: GenericAction;
  switchView?: GenericAction;
  cloneView?: GenericAction;

  addToNextOpenSlot?: GenericAction;
  addWidget?: GenericAction;
  changeMarkType?: GenericAction;
  changeTheme?: GenericAction;
  chainActions?: GenericAction;
  changeSelectedFile?: GenericAction;
  clearEncoding?: GenericAction;
  createFilter?: GenericAction;
  coerceType?: GenericAction;
  deleteTemplate?: GenericAction;
  setEditMode?: GenericAction;
  loadCustomDataset?: GenericAction;
  loadDataFromPredefinedDatasets?: GenericAction;
  loadTemplates?: GenericAction;
  modifyValueOnTemplate?: GenericAction;
  moveWidget?: GenericAction;
  updateFilter?: GenericAction;
  deleteFilter?: GenericAction;
  removeWidget?: GenericAction;
  saveCurrentTemplate?: GenericAction;
  setBlankTemplate?: GenericAction;
  setCodeMode?: GenericAction;
  setEncodingParameter?: GenericAction;
  setNewSpec?: GenericAction;
  setNewSpecCode?: GenericAction;
  setTemplateValue?: GenericAction;
  setRepeats?: GenericAction;
  setEncodingMode?: GenericAction;
  setWidgetValue?: GenericAction;
  swapXAndYChannels?: GenericAction;
  toggleDataModal?: GenericAction;
  setProgrammaticView?: GenericAction;
  triggerUndo?: GenericAction;
  triggerRedo?: GenericAction;
}

class RootComponent extends React.Component<RootProps> {
  componentDidMount() {
    // on start load the default selected file
    if (!this.props.GOOSE_MODE) {
      this.props.loadDataFromPredefinedDatasets(
        this.props.currentlySelectedFile,
      );
    }
    this.props.loadTemplates();
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ERRPR', error, errorInfo);
  }

  secondaryControls() {
    const {
      currentTheme,
      changeTheme,
      showProgrammaticMode,
      setProgrammaticView,
    } = this.props;
    return (
      <SecondaryControls
        setProgrammaticView={setProgrammaticView}
        showProgrammaticMode={showProgrammaticMode}
        currentTheme={currentTheme}
        changeTheme={changeTheme}
      />
    );
  }

  grammarMenu() {
    const {
      addWidget,
      addToNextOpenSlot,
      chainActions,
      coerceType,
      columns,
      changeMarkType,
      clearEncoding,
      createFilter,
      currentlySelectedFile,
      deleteFilter,
      deleteTemplate,
      editMode,
      encodingMode,
      iMspec,
      metaColumns,
      modifyValueOnTemplate,
      moveWidget,
      removeWidget,
      saveCurrentTemplate,
      spec,
      setBlankTemplate,
      setEditMode,
      setEncodingParameter,
      setEncodingMode,
      setNewSpec,
      setRepeats,
      setTemplateValue,
      setWidgetValue,
      swapXAndYChannels,
      updateFilter,
      template,
      templates,
      templateMap,
      templateSaveState,
      toggleDataModal,
    } = this.props;

    return (
      <div className="flex full-height column-border">
        <DndProvider backend={HTML5Backend}>
          <DataColumn
            addToNextOpenSlot={addToNextOpenSlot}
            columns={columns}
            coerceType={coerceType}
            currentlySelectedFile={currentlySelectedFile}
            createFilter={createFilter}
            iMspec={iMspec}
            metaColumns={metaColumns}
            toggleDataModal={toggleDataModal}
            template={template}
            setRepeats={setRepeats}
            spec={spec}
            updateFilter={updateFilter}
            deleteFilter={deleteFilter}
            onDropFilter={(item: any) => createFilter({field: item.text})}
          />
          <div className="flex-down full-height background-3 encoding-column-container">
            {SHOW_TEMPLATE_CONTROLS && (
              <EncodingControls
                chainActions={chainActions}
                encodingMode={encodingMode}
                deleteTemplate={deleteTemplate}
                templates={templates}
                setEncodingMode={setEncodingMode}
                clearEncoding={clearEncoding}
                editMode={editMode}
                setBlankTemplate={setBlankTemplate}
                setEditMode={setEditMode}
                template={template}
                saveCurrentTemplate={saveCurrentTemplate}
                templateSaveState={templateSaveState}
                modifyValueOnTemplate={modifyValueOnTemplate}
              />
            )}
            {encodingMode === 'grammer' && (
              <EncodingColumn
                iMspec={iMspec}
                changeMarkType={changeMarkType}
                setEncodingParameter={setEncodingParameter}
                spec={spec}
                columns={columns}
                metaColumns={metaColumns}
                setNewSpec={setNewSpec}
                swapXAndYChannels={swapXAndYChannels}
                onDrop={(item: any) => {
                  if (item.disable) {
                    return;
                  }
                  setEncodingParameter(item);
                }}
                onDropFilter={(item: any) => createFilter({field: item.text})}
              />
            )}
            {encodingMode !== 'grammer' && template && (
              <TemplateColumn
                addWidget={addWidget}
                editMode={editMode}
                template={template}
                templateMap={templateMap}
                columns={columns}
                moveWidget={moveWidget}
                removeWidget={removeWidget}
                setTemplateValue={setTemplateValue}
                setWidgetValue={setWidgetValue}
              />
            )}
          </div>
        </DndProvider>
      </div>
    );
  }

  programmaticMenu() {
    const {
      addWidget,
      setNewSpecCode,
      specCode,
      editorError,
      template,
      codeMode,
      setCodeMode,
      spec,
    } = this.props;
    return (
      <div className="flex full-height editor-column background-1">
        <CodeEditor
          addWidget={addWidget}
          setCodeMode={setCodeMode}
          codeMode={codeMode}
          setNewSpecCode={setNewSpecCode}
          template={template}
          specCode={specCode}
          spec={spec}
          editorError={editorError}
        />
      </div>
    );
  }

  chartArea() {
    const {
      cloneView,
      createNewView,
      currentTheme,
      currentView,
      data,
      deleteView,
      iMspec,
      missingFields,
      spec,
      switchView,
      template,
      templateComplete,
      views,
    } = this.props;
    return (
      <ChartArea
        cloneView={cloneView}
        createNewView={createNewView}
        deleteView={deleteView}
        switchView={switchView}
        currentView={currentView}
        data={data}
        spec={spec}
        iMspec={iMspec}
        missingFields={missingFields}
        template={template}
        templateComplete={templateComplete}
        currentTheme={currentTheme}
        views={views}
      />
    );
  }

  render() {
    const {
      canRedo,
      canUndo,
      changeSelectedFile,
      chainActions,
      dataModalOpen,
      loadCustomDataset,
      toggleDataModal,
      triggerUndo,
      triggerRedo,
      showProgrammaticMode,
    } = this.props;

    return (
      <div className="flex-down full-width full-height">
        {dataModalOpen && (
          <DataModal
            toggleDataModal={toggleDataModal}
            changeSelectedFile={changeSelectedFile}
            chainActions={chainActions}
            loadCustomDataset={loadCustomDataset}
          />
        )}
        <Header
          triggerUndo={triggerUndo}
          triggerRedo={triggerRedo}
          canRedo={canRedo}
          canUndo={canUndo}
        />
        <div className="flex full-height">
          <div className="flex full-height control-container">
            {showProgrammaticMode && this.programmaticMenu()}
            <div className="flex-down">
              {SHOW_SECONDARY_CONTROLS && this.secondaryControls()}
              {this.grammarMenu()}
            </div>
          </div>
          {this.chartArea()}
        </div>
      </div>
    );
  }
}

// TODO alphabetize
function mapStateToProps({base}: {base: AppState}): any {
  const template = base.get('currentTemplateInstance');
  const templateMap = base.get('templateMap').toJS();
  const missingFields =
    (template && getMissingFields(template.toJS(), templateMap)) || [];

  return {
    canUndo: base.get('undoStack').size >= 1,
    canRedo: base.get('redoStack').size >= 1,
    columns: base.get('columns'),
    codeMode: base.get('codeMode'),
    currentView: base.get('currentView'),
    data: base.get('data'),
    editorError: base.get('editorError'),
    encodingMode: base.get('encodingMode'),
    editMode: base.get('editMode'),
    spec: base.get('spec').toJS(),
    iMspec: base.get('spec'),
    metaColumns: base.get('metaColumns'),
    specCode: base.get('specCode'),
    showProgrammaticMode: base.get('showProgrammaticMode'),
    templateSaveState: getTemplateSaveState(base),
    missingFields,

    currentlySelectedFile: base.get('currentlySelectedFile'),
    dataModalOpen: base.get('dataModalOpen'),
    template: template && template.toJS(),
    templateComplete: !missingFields.length,
    currentTheme: base.get('currentTheme'),
    GOOSE_MODE: base.get('GOOSE_MODE'),
    templates: base.get('templates'),
    templateMap,
    views: base.get('views'),
  };
}

export default connect(mapStateToProps, actionCreators)(RootComponent);
