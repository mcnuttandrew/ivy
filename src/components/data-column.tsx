/* eslint-disable react/display-name */
import React from 'react';
import Filter from './filter';
import FilterTarget from './filter-target';
import {TiInfoLarge} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import Pill from './pill';
import {ColumnHeader} from '../types';
import {GenericAction, CoerceTypePayload, UpdateFilterPayload} from '../actions/index';
import {Template, CustomCard} from '../templates/types';
import {get, makeCustomType} from '../utils';
import SimpleTooltip from './simple-tooltip';

interface DataColumnProps {
  addToNextOpenSlot: GenericAction<ColumnHeader>;
  coerceType: GenericAction<CoerceTypePayload>;
  columns: ColumnHeader[];
  createFilter: (field: string) => void;
  deleteFilter: GenericAction<number>;
  fillableFields: Set<string>;
  onDropFilter: any;
  showGUIView: boolean;
  spec: any;
  template: Template;
  updateFilter: GenericAction<UpdateFilterPayload>;
}

interface MakePillProps {
  addToNextOpenSlot: GenericAction<ColumnHeader>;
  coerceType: GenericAction<CoerceTypePayload>;
  columns: ColumnHeader[];
  createFilter: (field: string) => void;
  fillableFields: Set<string>;
  showGUIView: boolean;
  spec: any;
  checkOptions: boolean;
}

type makePillType = (props: MakePillProps) => (column: ColumnHeader | CustomCard, idx: number) => JSX.Element;
const MakePill: makePillType = props => {
  const {addToNextOpenSlot, coerceType, createFilter, fillableFields, showGUIView} = props;

  return (column, idx): JSX.Element => {
    const isCustomCard = 'description' in column;
    const inferredColumn = isCustomCard
      ? makeCustomType({...column} as CustomCard)
      : (column as ColumnHeader);
    return (
      <div className="pill-container" key={`column-${idx}`}>
        <Pill
          column={inferredColumn}
          coerceType={coerceType}
          inEncoding={false}
          addToNextOpenSlot={addToNextOpenSlot}
          createFilter={createFilter}
          hideGUI={!showGUIView}
          typeNotAddable={isCustomCard ? false : !fillableFields.has(inferredColumn.type as string)}
        />
      </div>
    );
  };
};

export default function DataColumn(props: DataColumnProps): JSX.Element {
  const {columns, deleteFilter, onDropFilter, showGUIView, spec, template, updateFilter} = props;

  const canFilter = false;
  const hasCustomCards = template && template.customCards && template.customCards.length > 0;
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
      <div className="flex-down">{columns.map(MakePill({...props, checkOptions: false}))}</div>

      {hasCustomCards && (
        <h5 className="flex">
          Template Fields <SimpleTooltip message="Custom data fields that a unique to this template" />
        </h5>
      )}
      {hasCustomCards && (
        <div className="flex-down">{template.customCards.map(MakePill({...props, checkOptions: false}))}</div>
      )}

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
