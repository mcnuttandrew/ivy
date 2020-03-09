import React from 'react';
import Tooltip from 'rc-tooltip';
import {TiFilter, TiDeleteOutline, TiCogOutline, TiPlus} from 'react-icons/ti';

import {GenericAction, CoerceTypePayload} from '../actions/index';
import {useDrag} from 'react-dnd';
import {ColumnHeader, DataType} from '../types';
import {classnames} from '../utils';
import {HoverTooltip} from './tooltips';

export interface PillProps {
  addToNextOpenSlot?: GenericAction<ColumnHeader>;
  coerceType?: GenericAction<CoerceTypePayload>;
  column: ColumnHeader;
  containingField?: string;
  containingShelf?: string;
  createFilter?: GenericAction<ColumnHeader>;
  fieldSelector?: JSX.Element;
  hideGUI?: boolean;
  inEncoding: boolean;
  setParam?: any;
  typeNotAddable?: boolean;
}

interface AddToNextProps {
  typeNotAddable: boolean;
  addToNextOpenSlot: GenericAction<ColumnHeader>;
  column: ColumnHeader;
}
function addToNext(props: AddToNextProps): JSX.Element {
  const {typeNotAddable, addToNextOpenSlot, column} = props;
  const message = typeNotAddable
    ? 'We are unable to figure out where to place this column into the current template. If you know better than us, you can click and drag or use a drop down on the data target.'
    : 'Click to automatically add this column to the next available slot';
  return (
    <HoverTooltip message={message}>
      <div
        className={classnames({
          'fixed-symbol-width': true,
          'fixed-symbol-width-disable': typeNotAddable,
        })}
        onClick={(): any => !typeNotAddable && addToNextOpenSlot(column)}
      >
        <TiPlus />
      </div>
    </HoverTooltip>
  );
}

interface RemovePillProps {
  column: ColumnHeader;
  setParam: any;
  containingField: string;
}
function removePill(props: RemovePillProps): JSX.Element {
  const {setParam, column, containingField} = props;
  return (
    <HoverTooltip message={'Remove this field from the containing data targe'}>
      <div
        className="fixed-symbol-width"
        onClick={(): any => setParam({text: null, field: containingField, column})}
      >
        <TiDeleteOutline />
      </div>
    </HoverTooltip>
  );
}

interface AddFilterProps {
  column: ColumnHeader;
  inEncoding: boolean;
  createFilter?: GenericAction<ColumnHeader>;
}
function addFilter(props: AddFilterProps): JSX.Element {
  const {column, inEncoding, createFilter} = props;
  return (
    <HoverTooltip message="Create a new filter based on this column">
      <div
        className="fixed-symbol-width"
        onClick={(): any => {
          if (inEncoding) {
            return;
          }
          createFilter(column);
        }}
      >
        <TiFilter />
      </div>
    </HoverTooltip>
  );
}

interface BaseBallCardProps {
  column: ColumnHeader;
  field: string;
  coerceType: GenericAction<CoerceTypePayload>;
}
function baseBallCard(props: BaseBallCardProps): JSX.Element {
  const {column, field, coerceType} = props;
  const summaryManips = [
    {key: 'count', show: 'Rows'},
    {key: 'missing', show: 'Missing'},
    {key: 'distinct', show: 'Unique'},
    column.type !== 'DIMENSION' && {key: 'min', show: 'Min'},
    column.type !== 'DIMENSION' && {key: 'max', show: 'Max'},
  ].filter(d => d);
  const summaryPresent = Object.keys(column.summary).length;
  const isCustom = column.type === 'CUSTOM';
  return (
    <Tooltip
      placement="right"
      trigger="click"
      overlay={
        <div className="flex-down">
          <h3>Fields: {column.field}</h3>
          {isCustom && <h5>Description</h5>}
          {isCustom && <div>{column.summary.description}</div>}
          {!isCustom && summaryPresent > 0 && <h5>Basic Statistics</h5>}
          {!isCustom && summaryPresent > 0 && (
            <div>{summaryManips.map(({key, show}) => `${show}: ${column.summary[key]}`).join(', ')}</div>
          )}
          {!isCustom && <h5>Change Base Type</h5>}
          {!isCustom &&
            ['DIMENSION', 'MEASURE', 'TIME'].map((type: DataType) => {
              return (
                <div
                  className={classnames({
                    flex: true,
                    'selected-dimension': column.type === type,
                    'coerce-data-type-button': true,
                    [`coerce-data-type-to--${type}`]: true,
                  })}
                  key={type}
                >
                  <button
                    type="button"
                    className={classnames({
                      'selected-dimension': column.type === type,
                    })}
                    onClick={(): any => coerceType({field, type})}
                  >
                    {type}
                  </button>
                  {column.type === type && <span>(Currently)</span>}
                </div>
              );
            })}
          {!isCustom && (
            <button onClick={(): any => coerceType({field, type: column.originalType})}>
              RESET TO ORIGINAL ({column.originalType})
            </button>
          )}
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
    setParam,
    typeNotAddable,
  } = props;
  const field = column.field;
  const isCustom = column.type === 'CUSTOM';

  const [{opacity}, dragRef] = useDrag({
    item: {type: 'CARD', text: column.field, containingShelf},
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });
  const showAddFilter = !inEncoding && !hideGUI && createFilter && !isCustom;
  const showAutoAdd = !inEncoding && !hideGUI && addToNextOpenSlot;
  const showTypeCoerce = !inEncoding && coerceType;
  return (
    <div
      className={classnames({
        pill: true,
        flex: true,
        'in-encoding-panel': inEncoding,
        [`${column.type.toLowerCase()}-pill`]: true,
      })}
      ref={dragRef}
      style={{opacity}}
    >
      {showTypeCoerce && baseBallCard({column, field, coerceType})}
      <div className="pill-label">{column.field}</div>
      {showAddFilter && addFilter({column, inEncoding, createFilter})}
      {showAutoAdd && addToNext({column, addToNextOpenSlot, typeNotAddable})}
      {fieldSelector && <div className="fixed-symbol-width">{fieldSelector}</div>}
      {inEncoding && removePill({setParam, column, containingField})}
    </div>
  );
}
