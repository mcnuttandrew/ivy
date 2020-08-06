/* eslint-disable react/display-name */
import React, {useState} from 'react';
import {connect} from 'react-redux';
import Filter from '../components/filter';
import FilterTarget from '../components/filter-target';
import Pill from '../components/pill';
import {GenericAction, CoerceTypePayload} from '../actions/index';
import {AppState, CustomCard, ColumnHeader, DataTransform} from '../types';
import {makeCustomType} from '../utils';
import {SimpleTooltip} from '../components/tooltips';
import {TiDatabase} from 'react-icons/ti';

import * as actionCreators from '../actions/index';

import {DataRow, ActionUser} from '../actions/index';
import {computeValidAddNexts} from '../utils';

interface DataColumnProps extends ActionUser {
  columns: ColumnHeader[];
  currentlySelectedFile: string;
  customCards: CustomCard[];
  data: DataRow[];
  fillableFields: Set<string>;
  showGUIView: boolean;
  templateComplete: boolean;
  dataTransforms: DataTransform[];
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

function DataColumn(props: DataColumnProps): JSX.Element {
  const {
    columns,
    createFilter,
    deleteFilter,
    showGUIView,
    customCards,
    dataTransforms,
    updateFilter,
    currentlySelectedFile,
    setModalState,
  } = props;
  const hasCustomCards = customCards && customCards.length > 0;
  const columnGroups = columns.reduce(
    (acc, row) => {
      acc[row.type] = (acc[row.type] || []).concat(row);
      return acc;
    },
    {DIMENSION: [], MEASURE: [], TIME: []} as {[x: string]: ColumnHeader[]},
  );
  return (
    <div className="flex-down column background-2" id="data-column-container">
      <div className="flex-down" style={{maxHeight: 'fit-content'}}>
        <h1 className="section-title">Data</h1>
        <div className="flex data-selection">
          <TiDatabase />
          <div className="flex-down">
            <div className="section-subtitle"> {currentlySelectedFile || 'SELECT FILE'}</div>
            <button
              type="button"
              onClick={(): any => setModalState('data')}
              style={{textAlign: 'start', padding: 0}}
            >
              CHANGE
            </button>
          </div>
        </div>
      </div>
      <div className="flex-down">
        {Object.entries(columnGroups).map(makePillGroup({...props, checkOptions: false}))}

        {hasCustomCards && (
          <h5 className="flex">
            Template Fields <SimpleTooltip message="Custom data fields that a unique to this template" />
          </h5>
        )}
        {hasCustomCards && (
          <div className="flex-down">{customCards.map(MakePill({...props, checkOptions: false}))}</div>
        )}

        {showGUIView && <h5> Filter </h5>}
        {showGUIView && (
          <div className="flex-down">
            {dataTransforms
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
            <FilterTarget
              onDrop={(item: any): any => createFilter(columns.find(d => d.field === item.text))}
              columns={columns}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function mapStateToProps({base}: {base: AppState}): any {
  const template = base.currentTemplateInstance;
  const templateMap = base.templateMap;
  return {
    columns: base.columns,
    customCards: template.customCards,
    currentlySelectedFile: base.currentlySelectedFile,
    fillableFields: computeValidAddNexts(template, templateMap),
    showGUIView: base.showGUIView,
    dataTransforms: templateMap.systemValues.dataTransforms,
    viewCatalog: base.viewCatalog,
  };
}

function eqSet(as: Set<any>, bs: Set<any>): boolean {
  if (as.size !== bs.size) return false;
  for (const a of as) if (!bs.has(a)) return false;
  return true;
}
function equalityChecker(prevProps: any, nextProps: any): boolean {
  return Object.keys(prevProps).every(key => {
    if (key === 'fillableFields') {
      return eqSet(prevProps[key], nextProps[key]);
    }
    if (key === 'dataTransforms') {
      return JSON.stringify(prevProps[key]) === JSON.stringify(nextProps[key]);
    }
    return prevProps[key] === nextProps[key];
  });
}

export default connect(mapStateToProps, actionCreators)(React.memo(DataColumn, equalityChecker));
