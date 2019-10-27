import React from 'react';

import {GoPlus, GoTriangleDown} from 'react-icons/go';
import {TiFilter, TiDeleteOutline} from 'react-icons/ti';

import {GenericAction} from '../actions/index';
import {useDrag} from 'react-dnd';
import {ColumnHeader} from '../types';
import {getTypeSymbol} from '../utils';

export interface PillProps {
  column: ColumnHeader;
  containingField?: string;
  inEncoding: boolean;
  containingShelf?: string;
  setEncodingParameter?: GenericAction;
  addToNextOpenSlot?: GenericAction;
  createFilter?: GenericAction;
}

export default function Pill(props: PillProps) {
  const {
    column,
    inEncoding,
    setEncodingParameter,
    containingField,
    addToNextOpenSlot,
    containingShelf,
    createFilter,
  } = props;
  const [{opacity}, dragRef] = useDrag({
    item: {type: 'CARD', text: column.field, containingShelf},
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });
  return (
    <div className="pill flex" ref={dragRef} style={{opacity}}>
      {!inEncoding && (
        <div className="fixed-symbol-width">{<GoTriangleDown />}</div>
      )}
      <div className="fixed-symbol-width">{getTypeSymbol(column.type)}</div>
      <div className="pill-label">{column.field}</div>
      <div
        className="fixed-symbol-width"
        onClick={() => {
          if (inEncoding) {
            return;
          }
          createFilter(column);
        }}
      >
        {!inEncoding && <TiFilter />}
      </div>
      {!inEncoding && (
        <div
          className="fixed-symbol-width"
          onClick={() => addToNextOpenSlot(column)}
        >
          <GoPlus />
        </div>
      )}
      {inEncoding && (
        <div
          className="fixed-symbol-width"
          onClick={() =>
            setEncodingParameter({text: null, field: containingField})
          }
        >
          <TiDeleteOutline />
        </div>
      )}
    </div>
  );
}
