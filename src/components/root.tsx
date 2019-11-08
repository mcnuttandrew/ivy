import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {SHOW_SECONDARY_CONTROLS} from '../constants/CONFIG';

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

// TODO root props shouldn't all be optional, fix
interface RootProps {
  columns?: ColumnHeader[];
  canUndo?: boolean;
  canRedo?: boolean;
  editorError?: null | string;
  spec?: Spec;
  specCode?: string;
  data?: any; //TODO: define the data type
  iMspec?: any;
  metaColumns?: ColumnHeader[];
  selectedGUIMode?: string;
  currentlySelectedFile?: string;
  currentTheme?: VegaTheme;
  dataModalOpen?: boolean;
  unprouncableInGrammer?: boolean;

  addToNextOpenSlot?: GenericAction;
  changeGUIMode?: GenericAction;
  changeMarkType?: GenericAction;
  changeTheme?: GenericAction;
  chainActions?: GenericAction;
  changeSelectedFile?: GenericAction;
  clearEncoding?: GenericAction;
  clearUnprounceWarning?: GenericAction;
  createFilter?: GenericAction;
  coerceType?: GenericAction;
  loadCustomDataset?: GenericAction;
  loadDataFromPredefinedDatasets?: GenericAction;
  updateFilter?: GenericAction;
  deleteFilter?: GenericAction;
  setEncodingParameter?: GenericAction;
  setNewSpec?: GenericAction;
  setNewSpecCode?: GenericAction;
  setRepeats?: GenericAction;
  swapXAndYChannels?: GenericAction;
  toggleDataModal?: GenericAction;
  triggerUndo?: GenericAction;
  triggerRedo?: GenericAction;
}

class RootComponent extends React.Component<RootProps> {
  componentDidMount() {
    // on start load the default selected file
    this.props.loadDataFromPredefinedDatasets(this.props.currentlySelectedFile);
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
      iMspec,
      metaColumns,
      spec,
      setEncodingParameter,
      setNewSpec,
      setRepeats,
      updateFilter,
      toggleDataModal,
    } = this.props;
    return (
      <div className="flex full-height">
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
          />
          <EncodingColumn
            iMspec={iMspec}
            changeMarkType={changeMarkType}
            setEncodingParameter={setEncodingParameter}
            clearEncoding={clearEncoding}
            spec={spec}
            updateFilter={updateFilter}
            deleteFilter={deleteFilter}
            columns={columns}
            metaColumns={metaColumns}
            setNewSpec={setNewSpec}
            onDrop={(item: any) => {
              if (item.disable) {
                return;
              }
              setEncodingParameter(item);
            }}
            onDropFilter={(item: any) => createFilter({field: item.text})}
          />
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

  render() {
    // TODO alphabetize
    const {
      canRedo,
      canUndo,
      changeSelectedFile,
      chainActions,
      currentTheme,
      data,
      dataModalOpen,
      iMspec,
      loadCustomDataset,
      selectedGUIMode,
      spec,
      swapXAndYChannels,
      toggleDataModal,
      triggerUndo,
      triggerRedo,
      unprouncableInGrammer,
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
          <div className="flex-down full-height control-container">
            {SHOW_SECONDARY_CONTROLS && this.secondaryControls()}
            {selectedGUIMode === 'GRAMMAR' &&
              (unprouncableInGrammer ? this.errorMenu() : this.grammarMenu())}
            {selectedGUIMode === 'PROGRAMMATIC' && this.programmaticMenu()}
          </div>
          <div>
            <ChartArea
              data={data}
              spec={spec}
              iMspec={iMspec}
              swapXAndYChannels={swapXAndYChannels}
              currentTheme={currentTheme}
            />
          </div>
        </div>
      </div>
    );
  }
}

// TODO figure out base type
function mapStateToProps({base}: {base: AppState}): any {
  return {
    canUndo: base.get('undoStack').size >= 1,
    canRedo: base.get('redoStack').size >= 1,
    columns: base.get('columns'),
    data: base.get('data'),
    editorError: base.get('editorError'),
    spec: base.get('spec').toJS(),
    iMspec: base.get('spec'),
    metaColumns: base.get('metaColumns'),
    specCode: base.get('specCode'),
    currentlySelectedFile: base.get('currentlySelectedFile'),
    selectedGUIMode: base.get('selectedGUIMode'),
    dataModalOpen: base.get('dataModalOpen'),
    currentTheme: base.get('currentTheme'),
    unprouncableInGrammer: base.get('unprouncableInGrammer'),
  };
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
