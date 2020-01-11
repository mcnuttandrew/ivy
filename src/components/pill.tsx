import React, {useState} from 'react';

import {GoPlus, GoTriangleDown} from 'react-icons/go';
import {TiFilter, TiDeleteOutline} from 'react-icons/ti';

import {GenericAction} from '../actions/index';
import {useDrag} from 'react-dnd';
import {ColumnHeader} from '../types';
import DataSymbol from './data-symbol';
import {classnames} from '../utils';

export interface PillProps {
  addToNextOpenSlot?: GenericAction;
  coerceType?: GenericAction;
  column: ColumnHeader;
  containingField?: string;
  containingShelf?: string;
  createFilter?: GenericAction;
  inEncoding: boolean;
  setEncodingParameter?: any;
}

export default function Pill(props: PillProps): JSX.Element {
  const {
    addToNextOpenSlot,
    coerceType,
    column,
    containingField,
    containingShelf,
    createFilter,
    inEncoding,
    setEncodingParameter,
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
              {['DIMENSION', 'MEASURE', 'TIME'].map((type: string) => {
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
      {!isMeta && !inEncoding && createFilter && (
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
      {!isMeta && !inEncoding && addToNextOpenSlot && (
        <div className="fixed-symbol-width" onClick={(): any => addToNextOpenSlot(column)}>
          <GoPlus />
        </div>
      )}
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
