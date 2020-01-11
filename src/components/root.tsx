import {List} from 'immutable';
import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {getMissingFields} from '../reducers/template-actions';
import {Template, TemplateMap} from '../templates/types';

import {SHOW_SECONDARY_CONTROLS, SHOW_TEMPLATE_CONTROLS} from '../constants/CONFIG';

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
import TemplatePreviewColumn from './template-preview-column';

import EncodingControls from './encoding-controls';

// TODO root props shouldn't all be optional, fix
interface RootProps {
  GOOSE_MODE?: boolean;
  canRedo?: boolean;
  canUndo?: boolean;
  codeMode?: string;
  columns?: ColumnHeader[];
  currentTheme?: VegaTheme;
  currentView?: string;
  currentlySelectedFile?: string;
  data?: any; //TODO: define the data type
  dataModalOpen?: boolean;
  editMode?: boolean;
  editorError?: null | string;
  encodingMode?: string;
  iMspec?: any;
  metaColumns?: ColumnHeader[];
  missingFields?: string[];
  showProgrammaticMode?: boolean;
  showSimpleDisplay?: boolean;
  spec?: Spec;
  specCode?: string;
  template?: Template;
  templateComplete?: boolean;
  templateMap?: TemplateMap;
  templateSaveState?: string;
  templates?: Template[];
  views?: List<string>;

  addToNextOpenSlot?: GenericAction;
  addWidget?: GenericAction;
  chainActions?: GenericAction;
  changeMarkType?: GenericAction;
  changeSelectedFile?: GenericAction;
  changeTheme?: GenericAction;
  clearEncoding?: GenericAction;
  cloneView?: GenericAction;
  coerceType?: GenericAction;
  createFilter?: GenericAction;
  createNewView?: GenericAction;
  deleteFilter?: GenericAction;
  deleteTemplate?: GenericAction;
  deleteView?: GenericAction;
  loadCustomDataset?: GenericAction;
  loadDataFromPredefinedDatasets?: GenericAction;
  loadTemplates?: GenericAction;
  modifyValueOnTemplate?: GenericAction;
  moveWidget?: GenericAction;
  removeWidget?: GenericAction;
  saveCurrentTemplate?: GenericAction;
  setBlankTemplate?: GenericAction;
  setCodeMode?: GenericAction;
  setEditMode?: GenericAction;
  setEncodingMode?: GenericAction;
  setEncodingParameter?: GenericAction;
  setNewSpec?: GenericAction;
  setNewSpecCode?: GenericAction;
  setProgrammaticView?: GenericAction;
  setRepeats?: GenericAction;
  setSimpleDisplay?: GenericAction;
  setTemplateValue?: GenericAction;
  setWidgetValue?: GenericAction;
  swapXAndYChannels?: GenericAction;
  switchView?: GenericAction;
  toggleDataModal?: GenericAction;
  triggerRedo?: GenericAction;
  triggerUndo?: GenericAction;
  updateFilter?: GenericAction;
}

class RootComponent extends React.Component<RootProps> {
  componentDidMount(): void {
    // on start load the default selected file
    if (!this.props.GOOSE_MODE) {
      this.props.loadDataFromPredefinedDatasets(this.props.currentlySelectedFile);
    }
    this.props.loadTemplates();
  }

  componentDidCatch(error: any, errorInfo: any): void {
    console.error('ERRPR', error, errorInfo);
  }

  secondaryControls(): JSX.Element {
    const {
      currentTheme,
      changeTheme,
      showProgrammaticMode,
      setProgrammaticView,
      setSimpleDisplay,
      showSimpleDisplay,
    } = this.props;
    return (
      <SecondaryControls
        changeTheme={changeTheme}
        currentTheme={currentTheme}
        setProgrammaticView={setProgrammaticView}
        setSimpleDisplay={setSimpleDisplay}
        showProgrammaticMode={showProgrammaticMode}
        showSimpleDisplay={showSimpleDisplay}
      />
    );
  }

  grammarMenu(): JSX.Element {
    const {
      addToNextOpenSlot,
      addWidget,
      chainActions,
      changeMarkType,
      clearEncoding,
      coerceType,
      columns,
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
      setBlankTemplate,
      setEditMode,
      setEncodingMode,
      setEncodingParameter,
      setNewSpec,
      setRepeats,
      setTemplateValue,
      setWidgetValue,
      showSimpleDisplay,
      spec,
      swapXAndYChannels,
      template,
      templateMap,
      templateSaveState,
      templates,
      toggleDataModal,
      updateFilter,
    } = this.props;

    return (
      <div className="flex full-height column-border">
        <DndProvider backend={HTML5Backend}>
          {showSimpleDisplay && (
            <TemplatePreviewColumn
              encodingMode={encodingMode}
              setEncodingMode={setEncodingMode}
              templates={templates}
            />
          )}
          {!showSimpleDisplay && (
            <DataColumn
              addToNextOpenSlot={addToNextOpenSlot}
              coerceType={coerceType}
              columns={columns}
              createFilter={createFilter}
              currentlySelectedFile={currentlySelectedFile}
              deleteFilter={deleteFilter}
              iMspec={iMspec}
              metaColumns={metaColumns}
              onDropFilter={(item: any): any => createFilter({field: item.text})}
              setRepeats={setRepeats}
              spec={spec}
              template={template}
              toggleDataModal={toggleDataModal}
              updateFilter={updateFilter}
            />
          )}
          <div className="flex-down full-height background-3 encoding-column-container">
            {SHOW_TEMPLATE_CONTROLS && !showSimpleDisplay && (
              <EncodingControls
                chainActions={chainActions}
                clearEncoding={clearEncoding}
                deleteTemplate={deleteTemplate}
                editMode={editMode}
                encodingMode={encodingMode}
                modifyValueOnTemplate={modifyValueOnTemplate}
                saveCurrentTemplate={saveCurrentTemplate}
                setBlankTemplate={setBlankTemplate}
                setEditMode={setEditMode}
                setEncodingMode={setEncodingMode}
                template={template}
                templateSaveState={templateSaveState}
                templates={templates}
              />
            )}
            {encodingMode === 'grammer' && (
              <EncodingColumn
                changeMarkType={changeMarkType}
                columns={columns}
                iMspec={iMspec}
                metaColumns={metaColumns}
                onDrop={(item: any): void => {
                  if (item.disable) {
                    return;
                  }
                  setEncodingParameter(item);
                }}
                onDropFilter={(item: any): any => createFilter({field: item.text})}
                setEncodingParameter={setEncodingParameter}
                setNewSpec={setNewSpec}
                showSimpleDisplay={showSimpleDisplay}
                spec={spec}
                swapXAndYChannels={swapXAndYChannels}
              />
            )}
            {encodingMode !== 'grammer' && template && (
              <TemplateColumn
                addWidget={addWidget}
                columns={columns}
                editMode={editMode}
                moveWidget={moveWidget}
                removeWidget={removeWidget}
                setTemplateValue={setTemplateValue}
                setWidgetValue={setWidgetValue}
                showSimpleDisplay={showSimpleDisplay}
                template={template}
                templateMap={templateMap}
              />
            )}
          </div>
        </DndProvider>
      </div>
    );
  }

  programmaticMenu(): JSX.Element {
    const {
      addWidget,
      setNewSpecCode,
      specCode,
      editorError,
      template,
      codeMode,
      setCodeMode,
      templateMap,
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
          templateMap={templateMap}
          editorError={editorError}
        />
      </div>
    );
  }

  chartArea(): JSX.Element {
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

  render(): JSX.Element {
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
        <Header triggerUndo={triggerUndo} triggerRedo={triggerRedo} canRedo={canRedo} canUndo={canUndo} />
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
  const missingFields = (template && getMissingFields(template.toJS(), templateMap)) || [];

  return {
    GOOSE_MODE: base.get('GOOSE_MODE'),
    canRedo: base.get('redoStack').size >= 1,
    canUndo: base.get('undoStack').size >= 1,
    codeMode: base.get('codeMode'),
    columns: base.get('columns'),
    currentTheme: base.get('currentTheme'),
    currentView: base.get('currentView'),
    currentlySelectedFile: base.get('currentlySelectedFile'),
    data: base.get('data'),
    dataModalOpen: base.get('dataModalOpen'),
    editMode: base.get('editMode'),
    editorError: base.get('editorError'),
    encodingMode: base.get('encodingMode'),
    iMspec: base.get('spec'),
    metaColumns: base.get('metaColumns'),
    missingFields,
    showProgrammaticMode: base.get('showProgrammaticMode'),
    showSimpleDisplay: base.get('showSimpleDisplay'),
    spec: base.get('spec').toJS(),
    specCode: base.get('specCode'),
    template: template && template.toJS(),
    templateComplete: !missingFields.length,
    templateMap,
    templateSaveState: getTemplateSaveState(base),
    templates: base.get('templates'),
    views: base.get('views'),
  };
}

export default connect(mapStateToProps, actionCreators)(RootComponent);
