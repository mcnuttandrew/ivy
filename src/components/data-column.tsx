import React from 'react';
import {DiDatabase} from 'react-icons/di';
import {GenericAction} from '../actions/index';
import {ColumnHeader} from '../types';
import Pill from './pill';
import {configurationOptions, EncodingOption} from '../constants';
import ConfigurationOption from './configuration-option';

interface DataColumnProps {
  columns: ColumnHeader[];
  currentlySelectedFile: string;
  iMspec: any;
  metaColumns: ColumnHeader[];

  addToNextOpenSlot: GenericAction;
  coerceType: GenericAction;
  createFilter: GenericAction;
  toggleDataModal: GenericAction;
  setEncodingParameter: GenericAction;
  setNewSpec: GenericAction;
}

function shouldShowOptionsForMeta(column: ColumnHeader, imSpec: any) {
  return true;
  // ain;
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
      metaColumns,
      iMspec,
      setEncodingParameter,
      setNewSpec,
    } = this.props;
    const makePill = (checkOptions: boolean) => (column: ColumnHeader) => {
      // const metaOptionsToRender = (
      //   configurationOptions[`${column.field}-meta`] || []
      // ).filter((option: EncodingOption) => option.predicate(iMspec));
      // console.log(optionsToRender, column.field);

      return (
        <div className="pill-container" key={column.field}>
          <Pill
            column={column}
            coerceType={coerceType}
            inEncoding={false}
            addToNextOpenSlot={addToNextOpenSlot}
            createFilter={createFilter}
          />
          {checkOptions && <div></div>}
        </div>
      );
    };
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
        <h5>Data Columns</h5>
        <div className="flex-down">{columns.map(makePill(false))}</div>
        <h5>Meta Columns</h5>
        <div className="flex-down">{metaColumns.map(makePill(true))}</div>

        <div className="bottom-fill" />
      </div>
    );
  }
}
