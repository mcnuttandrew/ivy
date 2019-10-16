import React from 'react';
import {ColumnHeader} from '../types';

interface DataColumnProps {
  columns: ColumnHeader[];
}
export default class DataColumn extends React.Component<DataColumnProps> {
  render() {
    const {columns} = this.props;
    return (
      <div className="flex-down column full-height background-2">
        <h1> Data </h1>
        <div>DATA INPUT</div>
        <div className="flex-down">{columns}</div>
      </div>
    );
  }
}
