import React, {useState} from 'react';

import {GoPlus, GoTriangleDown} from 'react-icons/go';
import {TiFilter, TiDeleteOutline} from 'react-icons/ti';

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
  createFilter?: GenericAction<ColumnHeader>;
  fieldSelector?: JSX.Element;
  hideGUI?: boolean;
  inEncoding: boolean;
  setEncodingParameter?: any;
  typeNotAddable?: boolean;
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
  const [open, toggleOpen] = useState(false);

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
      {open && (
        <div>
          <div className="coercion-tooltip-background" onClick={(): any => toggleOpen(false)} />
          <div className="coercion-tooltip-container">
            <div className="coercion-tooltip">
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
          </div>
        </div>
      )}
      {!isMeta && !inEncoding && coerceType && (
        <div className="fixed-symbol-width" onClick={(): any => toggleOpen(!open)}>
          {<GoTriangleDown />}
        </div>
      )}
      <div className="fixed-symbol-width pill-symbol">
        <DataSymbol type={isMeta ? 'METACOLUMN' : column.type} />
      </div>
      <div className="pill-label">{column.field}</div>
      {/* Create filter */}
      {!isMeta && !inEncoding && !hideGUI && createFilter && (
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
      )}
      {/* add to next slot */}
      {!isMeta && !inEncoding && !hideGUI && addToNextOpenSlot && (
        <div
          className={classnames({
            'fixed-symbol-width': true,
            'fixed-symbol-width-disable': typeNotAddable,
          })}
          onClick={(): any => !typeNotAddable && addToNextOpenSlot(column)}
        >
          <GoPlus />
        </div>
      )}
      {/* Change current selection */}
      {fieldSelector && <div className="fixed-symbol-width">{fieldSelector}</div>}
      {/* Remove from shelf */}
      {inEncoding && (
        <div
          className="fixed-symbol-width"
          onClick={(): any => setEncodingParameter({text: null, field: containingField, column})}
        >
          <TiDeleteOutline />
        </div>
      )}
    </div>
  );
}
