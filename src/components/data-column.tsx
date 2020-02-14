import React from 'react';
import Filter from './filter';
import FilterTarget from './filter-target';
import MetaColumnPicker from './meta-column-picker';
import {TiInfoLarge} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import Pill from './pill';
import {ColumnHeader} from '../types';
import {GenericAction, CoerceTypePayload, SetRepeatsPayload, UpdateFilterPayload} from '../actions/index';
import {Template} from '../templates/types';
import {getAllInUseFields, get} from '../utils';

interface DataColumnProps {
  addToNextOpenSlot: GenericAction<ColumnHeader>;
  coerceType: GenericAction<CoerceTypePayload>;
  columns: ColumnHeader[];
  createFilter: (field: string) => void;
  deleteFilter: GenericAction<number>;
  fillableFields: Set<string>;
  metaColumns: ColumnHeader[];
  onDropFilter: any;
  setRepeats: GenericAction<SetRepeatsPayload>;
  showGUIView: boolean;
  spec: any;
  template?: Template;
  updateFilter: GenericAction<UpdateFilterPayload>;
}

export default class DataColumn extends React.Component<DataColumnProps> {
  makePill(checkOptions: boolean): (column: ColumnHeader) => JSX.Element {
    const {
      addToNextOpenSlot,
      coerceType,
      columns,
      createFilter,
      fillableFields,
      setRepeats,
      showGUIView,
      spec,
    } = this.props;
    const inUseFields = getAllInUseFields(spec);
    return (column: ColumnHeader): JSX.Element => {
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
              <MetaColumnPicker columns={columns} field={column.field} spec={spec} setRepeats={setRepeats} />
            </div>
          )}
        </div>
      );
    };
  }

  render(): JSX.Element {
    const {
      columns,
      deleteFilter,
      metaColumns,
      onDropFilter,
      showGUIView,
      spec,
      template,
      updateFilter,
    } = this.props;

    const canFilter = !template;
    return (
      <div className="flex-down full-height">
        <h5 className="flex">
          <span>Data Columns</span>
          <Tooltip
            placement="bottom"
            trigger="click"
            overlay={
              <span className="tooltip-internal">
                This is the data column, where you can modify the current pills. TODO: a example pill.
              </span>
            }
          >
            <div className="fixed-symbol-widthtooltip-icon">
              <TiInfoLarge />
            </div>
          </Tooltip>
        </h5>
        <div className="flex-down">{columns.map(this.makePill(false))}</div>
        {!template && showGUIView && <h5>Meta Columns</h5>}
        {!template && showGUIView && <div className="flex-down">{metaColumns.map(this.makePill(true))}</div>}

        {showGUIView && canFilter && <h5> Filter </h5>}
        {showGUIView && canFilter && (
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
        {showGUIView && canFilter && (
          <div>
            <FilterTarget onDrop={onDropFilter} />
          </div>
        )}
        <div className="bottom-fill" />
      </div>
    );
  }
}
