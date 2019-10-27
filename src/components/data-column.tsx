import React from 'react';
import {DiDatabase} from 'react-icons/di';
import {GenericAction} from '../actions/index';
import {ColumnHeader} from '../types';
import Pill from './pill';

interface DataColumnProps {
  columns: ColumnHeader[];
  currentlySelectedFile: string;

  addToNextOpenSlot: GenericAction;
  coerceType: GenericAction;
  createFilter: GenericAction;
  toggleDataModal: GenericAction;
}
export default class DataColumn extends React.Component<DataColumnProps> {
  render() {
    const {
      columns,
      coerceType,
      currentlySelectedFile,
      addToNextOpenSlot,
      createFilter,
      toggleDataModal,
    } = this.props;
    return (
      <div className="flex-down column full-height background-2 font-white">
        <h1 className="section-title">Data</h1>
        <div className="flex space-between data-selection">
          <div className="flex center">
            <DiDatabase />
            <div className="section-subtitle"> {currentlySelectedFile}</div>
          </div>
          <button onClick={toggleDataModal}>CHANGE</button>
        </div>
        <div className="flex-down">
          {columns.map(column => {
            return (
              <div className="pill-container" key={column.field}>
                <Pill
                  column={column}
                  coerceType={coerceType}
                  inEncoding={false}
                  addToNextOpenSlot={addToNextOpenSlot}
                  createFilter={createFilter}
                />
              </div>
            );
          })}
        </div>
        <div className="bottom-fill" />
      </div>
    );
  }
}