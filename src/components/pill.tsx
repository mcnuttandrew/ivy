import React from 'react';
import Tooltip from 'rc-tooltip';
import {TiFilter, TiDeleteOutline, TiCogOutline, TiPlus} from 'react-icons/ti';

import {GenericAction, CoerceTypePayload} from '../actions/index';
import {DataType} from '../types';
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
  showTip: boolean;
}
function addToNext(props: AddToNextProps): JSX.Element {
  const {typeNotAddable, addToNextOpenSlot, column, showTip} = props;
  const content = (
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
  if (!showTip) {
    return content;
  }
  return (
    <Tooltip
      placement="right"
      trigger="hover"
      overlay={
        <span className="tooltip-internal">
          {typeNotAddable
            ? 'We are unable to figure out where to place this column into the current template. If you know better than us, you can click and drag or use a drop down on the data target.'
            : 'Click to automatically add this column to the next available slot'}
        </span>
      }
    >
      {content}
    </Tooltip>
  );
}

interface RemovePillProps {
  column: ColumnHeader;
  setEncodingParameter: any;
  containingField: string;
  showTip: boolean;
}
function removePill(props: RemovePillProps): JSX.Element {
  const {setEncodingParameter, column, containingField, showTip} = props;
  const content = (
    <div
      className="fixed-symbol-width"
      onClick={(): any => setEncodingParameter({text: null, field: containingField, column})}
    >
      <TiDeleteOutline />
    </div>
  );
  if (!showTip) {
    return content;
  }
  return (
    <Tooltip
      placement="bottom"
      trigger="hover"
      overlay={<span className="tooltip-internal">Remove this field from the containing data target</span>}
    >
      {content}
    </Tooltip>
  );
}

interface PillTypeProps {
  column: ColumnHeader;
  isMeta: boolean;
  showTip: boolean;
}
function pillType({isMeta, column, showTip}: PillTypeProps): JSX.Element {
  const content = (
    <div className="fixed-symbol-width pill-symbol">
      <DataSymbol type={isMeta ? 'METACOLUMN' : column.type} />
    </div>
  );
  if (!showTip) {
    return content;
  }
  return (
    <Tooltip
      placement="right"
      trigger="hover"
      overlay={
        <span className="tooltip-internal">{`This column has type ${column.type}. You can change it by clicking the settings icon in the data column`}</span>
      }
    >
      {content}
    </Tooltip>
  );
}

interface AddFilterProps {
  column: ColumnHeader;
  inEncoding: boolean;
  createFilter?: (field: string) => void;
  showTip: boolean;
}
function addFilter(props: AddFilterProps): JSX.Element {
  const {column, inEncoding, createFilter, showTip} = props;
  const content = (
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
  if (!showTip) {
    return content;
  }
  return (
    <Tooltip
      placement="left"
      trigger="hover"
      overlay={<span className="tooltip-internal">Create a new filter based on this column</span>}
    >
      {content}
    </Tooltip>
  );
}

interface TypePopoverProps {
  column: ColumnHeader;
  field: string;
  coerceType: GenericAction<CoerceTypePayload>;
  showTip: boolean;
}
function typePopover(props: TypePopoverProps): JSX.Element {
  const {column, field, coerceType, showTip} = props;
  const content = (
    <div className="fixed-symbol-width">
      <TiCogOutline />
    </div>
  );
  if (!showTip) {
    return content;
  }
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
      {content}
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

  const [{opacity}, dragRef] = useDrag({
    item: {type: 'CARD', text: column.field, containingShelf, isMeta},
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });
  const showAddFilter = !isMeta && !inEncoding && !hideGUI && createFilter;
  const showAutoAdd = !isMeta && !inEncoding && !hideGUI && addToNextOpenSlot;
  const showTip = false;
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
      {!isMeta && !inEncoding && coerceType && typePopover({column, field, coerceType, showTip})}
      {pillType({isMeta, column, showTip})}
      <div className="pill-label">{column.field}</div>
      {showAddFilter && addFilter({column, inEncoding, createFilter, showTip})}
      {showAutoAdd && addToNext({column, addToNextOpenSlot, typeNotAddable, showTip})}
      {fieldSelector && <div className="fixed-symbol-width">{fieldSelector}</div>}
      {inEncoding && removePill({setEncodingParameter, column, containingField, showTip})}
    </div>
  );
}
