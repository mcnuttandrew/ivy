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
  spec?: Spec;
  specCode?: string;
  data?: any; //TODO: define the data type
  iMspec?: any;
  metaColumns?: ColumnHeader[];
  selectedGUIMode?: string;
  currentlySelectedFile?: string;
  currentTheme?: VegaTheme;
  dataModalOpen?: boolean;

  addToNextOpenSlot?: GenericAction;
  changeGUIMode?: GenericAction;
  changeMarkType?: GenericAction;
  changeTheme?: GenericAction;
  chainActions?: GenericAction;
  changeSelectedFile?: GenericAction;
  clearEncoding?: GenericAction;
  createFilter?: GenericAction;
  coerceType?: GenericAction;
  loadCustomDataset?: GenericAction;
  loadDataFromPredefinedDatasets?: GenericAction;
  updateFilter?: GenericAction;
  deleteFilter?: GenericAction;
  setEncodingParameter?: GenericAction;
  setNewSpec?: GenericAction;
  setNewSpecCode?: GenericAction;
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

  render() {
    // TODO alphabetize
    const {
      addToNextOpenSlot,
      canRedo,
      canUndo,
      coerceType,
      columns,
      changeSelectedFile,
      changeMarkType,
      changeGUIMode,
      changeTheme,
      chainActions,
      clearEncoding,
      createFilter,
      currentlySelectedFile,
      currentTheme,
      data,
      dataModalOpen,
      deleteFilter,
      iMspec,
      loadCustomDataset,
      metaColumns,
      selectedGUIMode,
      spec,
      specCode,
      setEncodingParameter,
      setNewSpec,
      setNewSpecCode,
      swapXAndYChannels,
      updateFilter,
      toggleDataModal,
      triggerUndo,
      triggerRedo,
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
            {SHOW_SECONDARY_CONTROLS && (
              <SecondaryControls
                currentTheme={currentTheme}
                changeTheme={changeTheme}
                selectedGUIMode={selectedGUIMode}
                spec={spec}
                setNewSpecCode={setNewSpecCode}
                changeGUIMode={changeGUIMode}
              />
            )}
            {selectedGUIMode === 'GRAMMAR' && (
              <div className="flex full-height">
                <DndProvider backend={HTML5Backend}>
                  <DataColumn
                    addToNextOpenSlot={addToNextOpenSlot}
                    columns={columns}
                    coerceType={coerceType}
                    currentlySelectedFile={currentlySelectedFile}
                    createFilter={createFilter}
                    metaColumns={metaColumns}
                    toggleDataModal={toggleDataModal}
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
                      setEncodingParameter(item);
                    }}
                    onDropFilter={(item: any) =>
                      createFilter({field: item.text})
                    }
                  />
                </DndProvider>
              </div>
            )}
            {selectedGUIMode === 'PROGRAMMATIC' && (
              <div className="flex full-height two-column">
                <CodeEditor
                  setNewSpecCode={setNewSpecCode}
                  currentCode={specCode}
                />
              </div>
            )}
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
    spec: base.get('spec').toJS(),
    iMspec: base.get('spec'),
    metaColumns: base.get('metaColumns'),
    specCode: base.get('specCode'),
    currentlySelectedFile: base.get('currentlySelectedFile'),
    selectedGUIMode: base.get('selectedGUIMode'),
    dataModalOpen: base.get('dataModalOpen'),
    currentTheme: base.get('currentTheme'),
  };
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
