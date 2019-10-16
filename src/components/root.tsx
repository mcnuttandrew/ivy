import React from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../actions/index.ts';

import {Spec} from 'vega-typings';
import {ColumnHeader} from './types.ts';

import Header from './header.tsx';
import DataColumn from './data-column.tsx';
import ChartArea from './chart-area.tsx';
import EncodingColumn from './encoding-column.tsx';

interface RootProps {
  columns?: ColumnHeader[];
  spec?: Spec; //TODO find vega-spec type
  data?: any;
}

interface RootState {}

class RootComponent extends React.Component<RootProps, RootState> {
  render() {
    const {columns, data, spec} = this.props;
    return (
      <div className="flex-down full-width full-height">
        <Header />
        <div className="flex full-height">
          <DataColumn columns={columns} />
          <EncodingColumn spec={spec} />
          <ChartArea data={data} spec={spec} />
        </div>
      </div>
    );
  }
}

// TODO figure out base type
function mapStateToProps({base}: {base: any}): any {
  return {columns: base.columns, data: base.data, spec: base.spec};
}

export default connect(
  mapStateToProps,
  actionCreators,
)(RootComponent);
