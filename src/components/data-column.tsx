/* eslint-disable react/display-name */
import React, {useState} from 'react';
import Filter from './filter';
import FilterTarget from './filter-target';
import Pill from './pill';
import {GenericAction, CoerceTypePayload, UpdateFilterPayload} from '../actions/index';
import {Template, CustomCard, ColumnHeader, TemplateMap} from '../types';
import {makeCustomType} from '../utils';
import {SimpleTooltip} from './tooltips';

interface DataColumnProps {
  addToNextOpenSlot: GenericAction<ColumnHeader>;
  coerceType: GenericAction<CoerceTypePayload>;
  columns: ColumnHeader[];
  createFilter: GenericAction<ColumnHeader>;
  deleteFilter: GenericAction<number>;
  fillableFields: Set<string>;
  onDropFilter: any;
  showGUIView: boolean;
  template: Template;
  templateMap: TemplateMap;
  updateFilter: GenericAction<UpdateFilterPayload>;
}

interface MakePillProps {
  addToNextOpenSlot: GenericAction<ColumnHeader>;
  coerceType: GenericAction<CoerceTypePayload>;
  columns: ColumnHeader[];
  createFilter: GenericAction<ColumnHeader>;
  fillableFields: Set<string>;
  showGUIView: boolean;
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

const makePillGroup = (props: MakePillProps) => ([key, columns]: [string, ColumnHeader[]]): JSX.Element => {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex-down" key={key}>
      <div className="flex space-between capitolize">
        <h5>{`${key.toLowerCase()} (${columns.length})`}</h5>
        <button type="button" onClick={(): any => setOpen(!open)}>
          {open ? 'hide' : 'show'}
        </button>
      </div>
      {(open ? columns : []).map(MakePill(props))}
    </div>
  );
};

export default function DataColumn(props: DataColumnProps): JSX.Element {
  const {columns, deleteFilter, onDropFilter, showGUIView, template, templateMap, updateFilter} = props;

  const hasCustomCards = template && template.customCards && template.customCards.length > 0;
  const columnGroups = columns.reduce(
    (acc, row) => {
      acc[row.type] = (acc[row.type] || []).concat(row);
      return acc;
    },
    {DIMENSION: [], MEASURE: [], TIME: []} as {[x: string]: ColumnHeader[]},
  );
  return (
    <div className="flex-down">
      {Object.entries(columnGroups).map(makePillGroup({...props, checkOptions: false}))}

      {hasCustomCards && (
        <h5 className="flex">
          Template Fields <SimpleTooltip message="Custom data fields that a unique to this template" />
        </h5>
      )}
      {hasCustomCards && (
        <div className="flex-down">{template.customCards.map(MakePill({...props, checkOptions: false}))}</div>
      )}

      {showGUIView && <h5> Filter </h5>}
      {showGUIView && (
        <div className="flex-down">
          {templateMap.systemValues.dataTransforms
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
                  updateFilter={(newFilterValue: (string | number)[]): any =>
                    updateFilter({newFilterValue, idx})
                  }
                  deleteFilter={(): any => deleteFilter(idx)}
                />
              );
            })}
        </div>
      )}
      {showGUIView && (
        <div>
          <FilterTarget onDrop={onDropFilter} columns={columns} />
        </div>
      )}
    </div>
  );
}
