import React from 'react';
import {DiDatabase} from 'react-icons/di';
import {GenericAction} from '../actions/index';
import {ColumnHeader} from '../types';
import Pill from './pill';
import VegaDataPreAlias from 'vega-datasets';
const VegaData: {[key: string]: any} = VegaDataPreAlias;

interface DataColumnProps {
  columns: ColumnHeader[];
  currentlySelectedFile: string;
  changeSelectedFile: GenericAction;
  addToNextOpenSlot: GenericAction;
  createFilter: GenericAction;
}
export default class DataColumn extends React.Component<DataColumnProps> {
  render() {
    const {
      columns,
      currentlySelectedFile,
      changeSelectedFile,
      addToNextOpenSlot,
      createFilter,
    } = this.props;
    return (
      <div className="flex-down column full-height background-2 font-white">
        <h1 className="section-title">Data</h1>
        <div className="flex">
          <div className="flex center">
            <DiDatabase />
            <div className="section-subtitle"> {currentlySelectedFile}</div>
          </div>
          <select
            className="data-select"
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
              <div className="pill-container" key={column.field}>
                <Pill
                  column={column}
                  inEncoding={false}
                  addToNextOpenSlot={addToNextOpenSlot}
                  createFilter={createFilter}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
