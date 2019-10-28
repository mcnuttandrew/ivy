import ReactDOM from 'react-dom';
import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import debounce from 'lodash.debounce';

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
  lints?: any;
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
  recieveLinting?: GenericAction;
  setEncodingParameter?: GenericAction;
  setNewSpec?: GenericAction;
  setNewSpecCode?: GenericAction;
  toggleDataModal?: GenericAction;
  triggerUndo?: GenericAction;
  triggerRedo?: GenericAction;
}

interface RootState {
  menuHeight: number;
  menuWidth: number;
  mainHeight: number;
  mainWidth: number;
}

class RootComponent extends React.Component<RootProps, RootState> {
  constructor(props: RootProps) {
    super(props);
    this.state = {
      menuHeight: 0,
      menuWidth: 0,
      mainHeight: 0,
      mainWidth: 0,
    };
    this.resize = this.resize.bind(this);
  }
  componentDidMount() {
    // on start load the default selected file
    this.props.loadDataFromPredefinedDatasets(this.props.currentlySelectedFile);
    window.addEventListener('resize', debounce(this.resize.bind(this), 50));
    this.resize();
    this.lintWorker = new Worker('../lint/worker.ts', {type: 'module'});
    this.lintWorker.onmessage = (event: any) => {
      switch (event.data.type) {
        default:
        case 'lintSpec':
          this.props.recieveLinting(event.data);
      }
    };
  }
  private lintWorker: any;

  componentDidUpdate(oldProps: RootProps) {
    if (!oldProps.iMspec.equals(this.props.iMspec)) {
      this.lintWorker.postMessage({type: 'evaluateSpec', spec: JSON.stringify(this.props.spec)});
    }
  }

  resize() {
    const menuNode: any = ReactDOM.findDOMNode(this.refs.menuContainer);
    const currentNode: any = ReactDOM.findDOMNode(this.refs.mainContainer);
    this.setState({
      menuHeight: menuNode.clientHeight,
      menuWidth: menuNode.clientWidth,
      mainHeight: currentNode.clientHeight,
      mainWidth: currentNode.clientWidth,
    });
  }

  render() {
    const {menuWidth, menuHeight, mainHeight, mainWidth} = this.state;
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
      lints,
      loadCustomDataset,
      selectedGUIMode,
      spec,
      specCode,
      setEncodingParameter,
      setNewSpec,
      setNewSpecCode,
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
          <div
            className="flex-down full-height control-container"
            ref="menuContainer"
          >
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
                  height={menuHeight - 65}
                  width={menuWidth}
                  currentCode={specCode}
                />
              </div>
            )}
          </div>
          <ChartArea
            data={data}
            spec={spec}
            height={mainHeight}
            width={mainWidth}
            setNewSpec={setNewSpec}
            currentTheme={currentTheme}
            lints={lints}
            ref="mainContainer"
          />
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
    specCode: base.get('specCode'),
    currentlySelectedFile: base.get('currentlySelectedFile'),
    selectedGUIMode: base.get('selectedGUIMode'),
    dataModalOpen: base.get('dataModalOpen'),
    currentTheme: base.get('currentTheme'),
    lints: base.get('lints').toJS()
  };
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
