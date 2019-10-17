import React from 'react';
import {GenericAction} from '../actions/index';
import {ColumnHeader} from '../types';
import Pill from './pill';
import VegaDataPreAlias from 'vega-datasets';
const VegaData: {[key: string]: any} = VegaDataPreAlias;

interface DataColumnProps {
  columns: ColumnHeader[];
  currentlySelectedFile: string;
  changeSelectedFile: GenericAction;
}
export default class DataColumn extends React.Component<DataColumnProps> {
  render() {
    const {columns, currentlySelectedFile, changeSelectedFile} = this.props;
    return (
      <div className="flex-down column full-height background-2">
        <h1> Data </h1>
        <div className="flex">
          <div>{currentlySelectedFile}</div>
          <select
            value={currentlySelectedFile}
            onChange={({target: {value}}) => changeSelectedFile(value)}
          >
            {Object.keys(VegaData).map(name => {
              return (
                <option value={name} key={name}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex-down">
          {columns.map(column => {
            return (
              <Pill column={column} key={column.field} inEncoding={false} />
            );
          })}
        </div>
      </div>
    );
  }
}
