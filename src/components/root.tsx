import ReactDOM from 'react-dom';
import React from 'react';
import {connect} from 'react-redux';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import debounce from 'lodash.debounce';

import * as actionCreators from '../actions/index';
import {GenericAction} from '../actions/index';

import {Spec} from 'vega-typings';
import {ColumnHeader} from '../types';
import {AppState} from '../reducers/index';
import {classnames} from '../utils';

import CodeEditor from './code-editor';

import Header from './header';
import DataColumn from './data-column';
import ChartArea from './chart-area';
import EncodingColumn from './encoding-column';

interface RootProps {
  columns?: ColumnHeader[];
  spec?: Spec;
  data?: any; //TODO: define the data type
  selectedGUIMode?: string;
  currentlySelectedFile?: string;

  addToNextOpenSlot?: GenericAction;
  changeGUIMode?: GenericAction;
  changeMarkType?: GenericAction;
  changeSelectedFile?: GenericAction;
  clearEncoding?: GenericAction;
  createFilter?: GenericAction;
  loadDataFromPredefinedDatasets?: GenericAction;
  updateFilter?: GenericAction;
  deleteFilter?: GenericAction;
  setEncodingParameter?: GenericAction;
  setNewSpec?: GenericAction;
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
    const {
      columns,
      data,
      spec,
      currentlySelectedFile,
      changeSelectedFile,
      setEncodingParameter,
      clearEncoding,
      changeMarkType,
      setNewSpec,
      addToNextOpenSlot,
      selectedGUIMode,
      changeGUIMode,
      createFilter,
      updateFilter,
      deleteFilter,
    } = this.props;

    return (
      <div className="flex-down full-width full-height">
        <Header />
        <div className="flex full-height">
          <div className="flex-down full-height" ref="menuContainer">
            <div className="secondary-controls flex-down">
              <h5>SECONDARY CONTROLS</h5>
              <div className="mode-selector flex">
                Mode:{' '}
                {['GRAMMAR', 'PROGRAMMATIC'].map(mode => {
                  return (
                    <div
                      key={mode}
                      onClick={() => changeGUIMode(mode)}
                      className={classnames({
                        'mode-option': true,
                        'selected-mode': mode === selectedGUIMode,
                      })}
                    >
                      {mode}
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedGUIMode === 'GRAMMAR' && (
              <div className="flex full-height">
                <DndProvider backend={HTML5Backend}>
                  <DataColumn
                    columns={columns}
                    currentlySelectedFile={currentlySelectedFile}
                    changeSelectedFile={changeSelectedFile}
                    createFilter={createFilter}
                    addToNextOpenSlot={addToNextOpenSlot}
                  />
                  <EncodingColumn
                    changeMarkType={changeMarkType}
                    setEncodingParameter={setEncodingParameter}
                    clearEncoding={clearEncoding}
                    spec={spec}
                    updateFilter={updateFilter}
                    deleteFilter={deleteFilter}
                    columns={columns}
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
              <div className="flex full-height">
                <CodeEditor
                  height={menuHeight - 65}
                  width={menuWidth}
                  currentCode={JSON.stringify(spec, null, 2)}
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
    columns: base.get('columns'),
    data: base.get('data'),
    spec: base.get('spec').toJS(),
    currentlySelectedFile: base.get('currentlySelectedFile'),
    selectedGUIMode: base.get('selectedGUIMode'),
  };
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
