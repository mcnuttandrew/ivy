import React from 'react';
import {DiDatabase} from 'react-icons/di';
import {Template} from '../templates/types';
import {GenericAction} from '../actions/index';
import {ColumnHeader} from '../types';
import {getAllInUseFields, get} from '../utils';
import Pill from './pill';
import Filter from './filter';
import FilterTarget from './filter-target';
import MetaColumnPicker from './meta-column-picker';

interface DataColumnProps {
  columns: ColumnHeader[];
  currentlySelectedFile: string;
  iMspec: any;
  spec: any;
  metaColumns: ColumnHeader[];
  template?: Template;

  addToNextOpenSlot: GenericAction;
  coerceType: GenericAction;
  createFilter: GenericAction;
  toggleDataModal: GenericAction;
  setRepeats: GenericAction;
  onDropFilter: GenericAction;
  deleteFilter: GenericAction;
  updateFilter: GenericAction;
}

export default class DataColumn extends React.Component<DataColumnProps> {
  render(): JSX.Element {
    const {
      columns,
      coerceType,
      currentlySelectedFile,
      addToNextOpenSlot,
      createFilter,
      toggleDataModal,
      metaColumns,
      iMspec,
      spec,
      setRepeats,
      template,

      deleteFilter,
      updateFilter,
      onDropFilter,
    } = this.props;
    const inUseFields = getAllInUseFields(iMspec);
    const makePill = (checkOptions: boolean) => (
      column: ColumnHeader,
    ): JSX.Element => {
      return (
        <div className="pill-container" key={column.field}>
          <Pill
            column={column}
            coerceType={coerceType}
            inEncoding={false}
            addToNextOpenSlot={addToNextOpenSlot}
            createFilter={createFilter}
          />
          {checkOptions && inUseFields.has(column.field) && (
            <div>
              <MetaColumnPicker
                columns={columns}
                field={column.field}
                iMspec={iMspec}
                setRepeats={setRepeats}
              />
            </div>
          )}
        </div>
      );
    };
    return (
      <div className="flex-down column full-height background-2 column-border">
        <h1 className="section-title">Data</h1>
        <div className="flex space-between data-selection">
          <div className="flex center">
            <DiDatabase />
            <div className="section-subtitle">
              {' '}
              {currentlySelectedFile || 'SELECT FILE'}
            </div>
          </div>
          <button onClick={toggleDataModal}>CHANGE</button>
        </div>
        <h5>Data Columns</h5>
        <div className="flex-down">{columns.map(makePill(false))}</div>
        {!template && <h5>Meta Columns</h5>}
        {!template && (
          <div className="flex-down">{metaColumns.map(makePill(true))}</div>
        )}

        <h5> Filter </h5>
        <div className="flex-down">
          {(spec.transform || get(spec, ['spec', 'transform']) || [])
            .filter((filter: any) => {
              // dont try to render filters that we dont know how to render
              return filter.filter && !filter.filter.and;
            })
            .map((filter: any, idx: number) => {
              return (
                <Filter
                  column={columns.find(
                    ({field}) => field === filter.filter.field,
                  )}
                  filter={filter}
                  key={`${idx}-filter`}
                  updateFilter={(newFilterValue: any): void => {
                    updateFilter({newFilterValue, idx});
                  }}
                  deleteFilter={(): any => deleteFilter(idx)}
                />
              );
            })}
        </div>
        <div>
          <FilterTarget onDrop={onDropFilter} />
        </div>

        <div className="bottom-fill" />
      </div>
    );
  }
}
