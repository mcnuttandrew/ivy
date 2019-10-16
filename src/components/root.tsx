import React from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../actions/index';
import {GenericAction} from '../actions/index';

import {Spec} from 'vega-typings';
import {ColumnHeader} from '../types';
import {AppState} from '../reducers/index';

import Header from './header';
import DataColumn from './data-column';
import ChartArea from './chart-area';
import EncodingColumn from './encoding-column';

interface RootProps {
  columns?: ColumnHeader[];
  spec?: Spec;
  data?: any; //TODO: define the data type
  currentlySelectedFile?: string;

  loadDataFromPredefinedDatasets?: GenericAction;
  changeSelectedFile?: GenericAction;
}

interface RootState {}

class RootComponent extends React.Component<RootProps, RootState> {
  componentDidMount() {
    // on start load the default selected file
    this.props.loadDataFromPredefinedDatasets(this.props.currentlySelectedFile);
  }
  render() {
    const {
      columns,
      data,
      spec,
      currentlySelectedFile,
      changeSelectedFile,
    } = this.props;
    return (
      <div className="flex-down full-width full-height">
        <Header />
        <div className="flex full-height">
          <DataColumn
            columns={columns}
            currentlySelectedFile={currentlySelectedFile}
            changeSelectedFile={changeSelectedFile}
          />
          <EncodingColumn spec={spec} />
          <ChartArea data={data} spec={spec} />
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
    spec: base.get('spec'),
    currentlySelectedFile: base.get('currentlySelectedFile'),
  };
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
