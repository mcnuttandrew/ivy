import React from 'react';
import Tooltip from 'rc-tooltip';
import {TiFilter, TiDeleteOutline, TiCogOutline, TiPlus} from 'react-icons/ti';

import {GenericAction, CoerceTypePayload} from '../actions/index';
import {DataType} from '../templates/types';
import {useDrag} from 'react-dnd';
import {ColumnHeader} from '../types';
import DataSymbol from './data-symbol';
import {classnames} from '../utils';

export interface PillProps {
  addToNextOpenSlot?: GenericAction<ColumnHeader>;
  coerceType?: GenericAction<CoerceTypePayload>;
  column: ColumnHeader;
  containingField?: string;
  containingShelf?: string;
  createFilter?: (field: string) => void;
  fieldSelector?: JSX.Element;
  hideGUI?: boolean;
  inEncoding: boolean;
  setEncodingParameter?: any;
  typeNotAddable?: boolean;
}

interface AddToNextProps {
  typeNotAddable: boolean;
  addToNextOpenSlot: GenericAction<ColumnHeader>;
  column: ColumnHeader;
}
function addToNext(props: AddToNextProps): JSX.Element {
  const {typeNotAddable, addToNextOpenSlot, column} = props;
  return (
    <div
      className={classnames({
        'fixed-symbol-width': true,
        'fixed-symbol-width-disable': typeNotAddable,
      })}
      onClick={(): any => !typeNotAddable && addToNextOpenSlot(column)}
    >
      <TiPlus />
    </div>
  );
}

interface RemovePillProps {
  column: ColumnHeader;
  setEncodingParameter: any;
  containingField: string;
}
function removePill(props: RemovePillProps): JSX.Element {
  const {setEncodingParameter, column, containingField} = props;
  return (
    <div
      className="fixed-symbol-width"
      onClick={(): any => setEncodingParameter({text: null, field: containingField, column})}
    >
      <TiDeleteOutline />
    </div>
  );
}

interface PillTypeProps {
  column: ColumnHeader;
  isMeta: boolean;
}
function pillType({isMeta, column}: PillTypeProps): JSX.Element {
  return (
    <div className="fixed-symbol-width pill-symbol">
      <DataSymbol type={isMeta ? 'METACOLUMN' : column.type} />
    </div>
  );
}

interface AddFilterProps {
  column: ColumnHeader;
  inEncoding: boolean;
  createFilter?: (field: string) => void;
}
function addFilter(props: AddFilterProps): JSX.Element {
  const {column, inEncoding, createFilter} = props;
  return (
    <div
      className="fixed-symbol-width"
      onClick={(): any => {
        if (inEncoding) {
          return;
        }
        createFilter(column.field);
      }}
    >
      <TiFilter />
    </div>
  );
}

interface TypePopoverProps {
  column: ColumnHeader;
  field: string;
  coerceType: GenericAction<CoerceTypePayload>;
}
function typePopover(props: TypePopoverProps): JSX.Element {
  const {column, field, coerceType} = props;

  return (
    <Tooltip
      placement="right"
      trigger="click"
      overlay={
        <div className="tooltip-internal flex-down">
          <h5>Change Base Type</h5>
          {['DIMENSION', 'MEASURE', 'TIME'].map((type: DataType) => {
            return (
              <button
                className={classnames({
                  'selected-dimension': column.type === type,
                })}
                onClick={(): any => coerceType({field, type})}
                key={type}
              >
                {type}
              </button>
            );
          })}
          <button onClick={(): any => coerceType({field, type: column.originalType})}>
            RESET TO ORIGINAL
          </button>
        </div>
      }
    >
      <div className="fixed-symbol-width">
        <TiCogOutline />
      </div>
    </Tooltip>
  );
}

export default function Pill(props: PillProps): JSX.Element {
  const {
    addToNextOpenSlot,
    coerceType,
    column,
    containingField,
    containingShelf,
    createFilter,
    fieldSelector,
    hideGUI,
    inEncoding,
    setEncodingParameter,
    typeNotAddable,
  } = props;
  const field = column.field;
  const isMeta = column.metaColumn;
  const isCustom = column.type === 'CUSTOM';

  const [{opacity}, dragRef] = useDrag({
    item: {type: 'CARD', text: column.field, containingShelf, isMeta},
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });
  const showAddFilter = !isMeta && !inEncoding && !hideGUI && createFilter && !isCustom;
  const showAutoAdd = !isMeta && !inEncoding && !hideGUI && addToNextOpenSlot && !isCustom;
  const showTypeCoerce = !isMeta && !inEncoding && coerceType && !isCustom;
  return (
    <div
      className={classnames({
        pill: true,
        flex: true,
        'in-encoding-panel': inEncoding,
        [`${isMeta ? 'metacolumn' : column.type.toLowerCase()}-pill`]: true,
      })}
      ref={dragRef}
      style={{opacity}}
    >
      {showTypeCoerce && typePopover({column, field, coerceType})}
      {pillType({isMeta, column})}
      <div className="pill-label">{column.field}</div>
      {showAddFilter && addFilter({column, inEncoding, createFilter})}
      {showAutoAdd && addToNext({column, addToNextOpenSlot, typeNotAddable})}
      {fieldSelector && <div className="fixed-symbol-width">{fieldSelector}</div>}
      {inEncoding && removePill({setEncodingParameter, column, containingField})}
    </div>
  );
}
