import {List} from 'immutable';
import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {checkIfMapComplete} from '../reducers/template-actions';
import {Template, TemplateMap} from '../templates/types';

import {
  SHOW_SECONDARY_CONTROLS,
  SHOW_TEMPLATE_CONTROLS,
} from '../constants/CONFIG';

import * as actionCreators from '../actions/index';
import {GenericAction} from '../actions/index';

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
import TemplateBuilderModal from './template-builder-modal';
import EncodingControls from './encoding-controls';

// TODO root props shouldn't all be optional, fix
interface RootProps {
  columns?: ColumnHeader[];
  canUndo?: boolean;
  canRedo?: boolean;
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
  showProgrammaticMode?: boolean;
  template?: Template;
  templates?: Template[];
  templateMap?: TemplateMap;
  templateComplete?: boolean;
  templateBuilderModalOpen?: boolean;
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
  createTemplate?: GenericAction;
  coerceType?: GenericAction;
  deleteTemplate?: GenericAction;
  setEditMode?: GenericAction;
  loadCustomDataset?: GenericAction;
  loadDataFromPredefinedDatasets?: GenericAction;
  loadTemplates?: GenericAction;
  updateFilter?: GenericAction;
  deleteFilter?: GenericAction;
  removeWidget?: GenericAction;
  setEncodingParameter?: GenericAction;
  setNewSpec?: GenericAction;
  setNewSpecCode?: GenericAction;
  setTemplateValue?: GenericAction;
  setRepeats?: GenericAction;
  setEncodingMode?: GenericAction;
  setWidgetValue?: GenericAction;
  startTemplateEdit?: GenericAction;
  swapXAndYChannels?: GenericAction;
  toggleDataModal?: GenericAction;
  toggleTemplateBuilder?: GenericAction;
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
      removeWidget,
      spec,
      setEditMode,
      setEncodingParameter,
      setEncodingMode,
      setNewSpec,
      setRepeats,
      setTemplateValue,
      setWidgetValue,
      startTemplateEdit,
      swapXAndYChannels,
      updateFilter,
      template,
      templates,
      templateMap,
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
            setRepeats={setRepeats}
            spec={spec}
            updateFilter={updateFilter}
            deleteFilter={deleteFilter}
            onDropFilter={(item: any) => createFilter({field: item.text})}
          />
          <div className="flex-down full-height background-3 encoding-column-container">
            {SHOW_TEMPLATE_CONTROLS && (
              <EncodingControls
                encodingMode={encodingMode}
                deleteTemplate={deleteTemplate}
                templates={templates}
                setEncodingMode={setEncodingMode}
                startTemplateEdit={startTemplateEdit}
                clearEncoding={clearEncoding}
                editMode={editMode}
                setEditMode={setEditMode}
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
    const {setNewSpecCode, specCode, editorError, template} = this.props;
    return (
      <div className="flex full-height editor-column background-1">
        <CodeEditor
          setNewSpecCode={setNewSpecCode}
          currentCode={template ? template.code : specCode}
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
      createTemplate,
      dataModalOpen,
      loadCustomDataset,
      spec,
      toggleDataModal,
      triggerUndo,
      triggerRedo,
      showProgrammaticMode,
      templates,
      templateBuilderModalOpen,
      toggleTemplateBuilder,
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
        {templateBuilderModalOpen && (
          <TemplateBuilderModal
            createTemplate={createTemplate}
            toggleTemplateBuilder={toggleTemplateBuilder}
            spec={spec}
            editFrom={templates.find(
              (template: Template) =>
                typeof templateBuilderModalOpen === 'string' &&
                template.templateName === templateBuilderModalOpen,
            )}
          />
        )}
        <Header
          triggerUndo={triggerUndo}
          triggerRedo={triggerRedo}
          canRedo={canRedo}
          canUndo={canUndo}
          toggleTemplateBuilder={toggleTemplateBuilder}
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
  const templateComplete =
    template && checkIfMapComplete(template.toJS(), templateMap);

  return {
    canUndo: base.get('undoStack').size >= 1,
    canRedo: base.get('redoStack').size >= 1,
    columns: base.get('columns'),

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

    currentlySelectedFile: base.get('currentlySelectedFile'),
    dataModalOpen: base.get('dataModalOpen'),
    template: template && template.toJS(),
    templateBuilderModalOpen: base.get('templateBuilderModalOpen'),
    templateComplete,
    currentTheme: base.get('currentTheme'),
    GOOSE_MODE: base.get('GOOSE_MODE'),
    templates: base.get('templates'),
    templateMap,
    views: base.get('views'),
  };
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
