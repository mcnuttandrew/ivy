import {List} from 'immutable';
import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {Template, TemplateMap} from '../constants/templates';

import {
  SHOW_SECONDARY_CONTROLS,
  SHOW_TEMPLATE_CONTROLS,
} from '../constants/CONFIG';

import * as actionCreators from '../actions/index';
import {GenericAction} from '../actions/index';
import {currentTemplate} from '../utils';

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
import EncodingModeSelector from './encoding-mode-selector';
import TemplateBuilderModal from './template-builder-modal';

// TODO root props shouldn't all be optional, fix
interface RootProps {
  columns?: ColumnHeader[];
  canUndo?: boolean;
  canRedo?: boolean;
  editorError?: null | string;
  spec?: Spec;
  specCode?: string;
  data?: any; //TODO: define the data type
  encodingMode?: string;
  GOOSE_MODE?: boolean;
  iMspec?: any;
  metaColumns?: ColumnHeader[];
  selectedGUIMode?: string;
  currentlySelectedFile?: string;
  currentTheme?: VegaTheme;
  dataModalOpen?: boolean;
  unprouncableInGrammer?: boolean;
  template?: Template;
  templates?: Template[];
  templateMap?: TemplateMap;
  templateBuilderModalOpen?: boolean;
  currentView?: string;
  views?: List<string>;

  createNewView?: GenericAction;
  deleteView?: GenericAction;
  switchView?: GenericAction;
  cloneView?: GenericAction;

  addToNextOpenSlot?: GenericAction;
  changeGUIMode?: GenericAction;
  changeMarkType?: GenericAction;
  changeTheme?: GenericAction;
  chainActions?: GenericAction;
  changeSelectedFile?: GenericAction;
  clearEncoding?: GenericAction;
  clearUnprounceWarning?: GenericAction;
  createFilter?: GenericAction;
  createTemplate?: GenericAction;
  coerceType?: GenericAction;
  deleteTemplate?: GenericAction;
  loadCustomDataset?: GenericAction;
  loadDataFromPredefinedDatasets?: GenericAction;
  loadTemplates?: GenericAction;
  updateFilter?: GenericAction;
  deleteFilter?: GenericAction;
  setEncodingParameter?: GenericAction;
  setNewSpec?: GenericAction;
  setNewSpecCode?: GenericAction;
  setTemplateValue?: GenericAction;
  setRepeats?: GenericAction;
  setEncodingMode?: GenericAction;
  startTemplateEdit?: GenericAction;
  swapXAndYChannels?: GenericAction;
  toggleDataModal?: GenericAction;
  toggleTemplateBuilder?: GenericAction;
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
      selectedGUIMode,
      spec,
      setNewSpecCode,
      changeGUIMode,
    } = this.props;
    return (
      <SecondaryControls
        currentTheme={currentTheme}
        changeTheme={changeTheme}
        selectedGUIMode={selectedGUIMode}
        spec={spec}
        setNewSpecCode={setNewSpecCode}
        changeGUIMode={changeGUIMode}
      />
    );
  }

  grammarMenu() {
    const {
      addToNextOpenSlot,
      coerceType,
      columns,
      changeMarkType,
      clearEncoding,
      createFilter,
      currentlySelectedFile,
      deleteFilter,
      deleteTemplate,
      encodingMode,
      iMspec,
      metaColumns,
      spec,
      setEncodingParameter,
      setEncodingMode,
      setNewSpec,
      setRepeats,
      setTemplateValue,
      startTemplateEdit,
      swapXAndYChannels,
      updateFilter,
      templates,
      templateMap,
      toggleDataModal,
    } = this.props;
    const foundTemplate = templates.find(
      template => template.templateName === encodingMode,
    );
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
          <div className="flex-down full-height background-3">
            {SHOW_TEMPLATE_CONTROLS && (
              <div className="encoding-mode-selector">
                <div className="flex-down">
                  <h1 className="section-title">ENCODING MODE</h1>
                  <h3>{encodingMode}</h3>
                </div>
                <EncodingModeSelector
                  deleteTemplate={deleteTemplate}
                  templates={templates}
                  setEncodingMode={setEncodingMode}
                  startTemplateEdit={startTemplateEdit}
                />
              </div>
            )}
            {encodingMode === 'grammer' && (
              <EncodingColumn
                iMspec={iMspec}
                changeMarkType={changeMarkType}
                setEncodingParameter={setEncodingParameter}
                clearEncoding={clearEncoding}
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
            {encodingMode !== 'grammer' && foundTemplate && (
              <TemplateColumn
                template={foundTemplate}
                templateMap={templateMap}
                columns={columns}
                setTemplateValue={setTemplateValue}
              />
            )}
          </div>
        </DndProvider>
      </div>
    );
  }

  programmaticMenu() {
    const {setNewSpecCode, specCode, editorError} = this.props;
    return (
      <div className="flex full-height two-column">
        <CodeEditor
          setNewSpecCode={setNewSpecCode}
          currentCode={specCode}
          editorError={editorError}
        />
      </div>
    );
  }

  errorMenu() {
    const {clearUnprounceWarning} = this.props;
    return (
      <div className="full-height full-width inline-block error-container">
        <h3>Error</h3>
        <h5>
          The Vega-lite Specification that you have constructed is not supported
          by the grammar mode.
        </h5>
        <br />
        <h5>
          {' '}
          You can resolve this error by modifying the spec. Please note that
          layers are not supported at this time.
        </h5>
        <br />
        <h5>
          If you like you are welcome to try to over-ride this error, but the
          application make construct suprirsing and less than satisfactory
          result
        </h5>
        <button onClick={clearUnprounceWarning}>OVER RIDE</button>
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
      selectedGUIMode,
      spec,
      toggleDataModal,
      triggerUndo,
      triggerRedo,
      unprouncableInGrammer,
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
          <div className="flex-down full-height control-container">
            {SHOW_SECONDARY_CONTROLS && this.secondaryControls()}
            {selectedGUIMode === 'GUI' &&
              (unprouncableInGrammer ? this.errorMenu() : this.grammarMenu())}
            {selectedGUIMode === 'PROGRAMMATIC' && this.programmaticMenu()}
          </div>
          {this.chartArea()}
        </div>
      </div>
    );
  }
}

// TODO figure out base type
function mapStateToProps({base}: {base: AppState}): any {
  // TODO alphabetize
  return {
    canUndo: base.get('undoStack').size >= 1,
    canRedo: base.get('redoStack').size >= 1,
    columns: base.get('columns'),
    currentView: base.get('currentView'),
    data: base.get('data'),
    editorError: base.get('editorError'),
    encodingMode: base.get('encodingMode'),
    spec: base.get('spec').toJS(),
    iMspec: base.get('spec'),
    metaColumns: base.get('metaColumns'),
    specCode: base.get('specCode'),
    currentlySelectedFile: base.get('currentlySelectedFile'),
    selectedGUIMode: base.get('selectedGUIMode'),
    dataModalOpen: base.get('dataModalOpen'),
    templateBuilderModalOpen: base.get('templateBuilderModalOpen'),
    template: currentTemplate(base),
    currentTheme: base.get('currentTheme'),
    unprouncableInGrammer: base.get('unprouncableInGrammer'),
    GOOSE_MODE: base.get('GOOSE_MODE'),
    templates: base.get('templates'),
    templateMap: base.get('templateMap').toJS(),
    views: base.get('views'),
  };
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
