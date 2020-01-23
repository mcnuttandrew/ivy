import React from 'react';
import Filter from './filter';
import FilterTarget from './filter-target';
import MetaColumnPicker from './meta-column-picker';
import Pill from './pill';
import {ColumnHeader} from '../types';
import {GenericAction} from '../actions/index';
import {Template} from '../templates/types';
import {getAllInUseFields, get} from '../utils';

interface DataColumnProps {
  addToNextOpenSlot: GenericAction;
  coerceType: GenericAction;
  columns: ColumnHeader[];
  createFilter: GenericAction;
  deleteFilter: GenericAction;
  fillableFields: Set<string>;
  iMspec: any;
  metaColumns: ColumnHeader[];
  onDropFilter: GenericAction;
  setRepeats: GenericAction;
  showGUIView: boolean;
  spec: any;
  template?: Template;
  updateFilter: GenericAction;
}

export default class DataColumn extends React.Component<DataColumnProps> {
  render(): JSX.Element {
    const {
      addToNextOpenSlot,
      coerceType,
      columns,
      createFilter,
      deleteFilter,
      fillableFields,
      iMspec,
      metaColumns,
      onDropFilter,
      setRepeats,
      showGUIView,
      spec,
      template,
      updateFilter,
    } = this.props;
    const inUseFields = getAllInUseFields(iMspec);
    const makePill = (checkOptions: boolean) => (column: ColumnHeader): JSX.Element => {
      return (
        <div className="pill-container" key={column.field}>
          <Pill
            column={column}
            coerceType={coerceType}
            inEncoding={false}
            addToNextOpenSlot={addToNextOpenSlot}
            createFilter={createFilter}
            hideGUI={!showGUIView}
            typeNotAddable={!fillableFields.has(column.type as string)}
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
      <div className="flex-down full-height">
        <h5>Data Columns</h5>
        <div className="flex-down">{columns.map(makePill(false))}</div>
        {!template && showGUIView && <h5>Meta Columns</h5>}
        {!template && showGUIView && <div className="flex-down">{metaColumns.map(makePill(true))}</div>}

        {showGUIView && <h5> Filter </h5>}
        {showGUIView && (
          <div className="flex-down">
            {(spec.transform || get(spec, ['spec', 'transform']) || [])
              .filter((filter: any) => {
                // dont try to render filters that we dont know how to render
                return filter.filter && !filter.filter.and;
              })
              .map((filter: any, idx: number) => {
                return (
                  <Filter
                    column={columns.find(({field}) => field === filter.filter.field)}
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
        )}
        {showGUIView && (
          <div>
            <FilterTarget onDrop={onDropFilter} />
          </div>
        )}
        <div className="bottom-fill" />
      </div>
    );
  }
}
