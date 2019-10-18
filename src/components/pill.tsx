import React from 'react';

import {GoPlus, GoTriangleDown} from 'react-icons/go';
import {
  TiFilter,
  TiSortNumerically,
  TiSortAlphabetically,
  TiCalendar,
  TiDeleteOutline,
} from 'react-icons/ti';

import {GenericAction} from '../actions/index';
import {useDrag} from 'react-dnd';
import {ColumnHeader, DataType} from '../types';

export interface PillProps {
  column: ColumnHeader;
  containingField?: string;
  inEncoding: boolean;
  setEncodingParameter?: GenericAction;
  addToNextOpenSlot?: GenericAction;
}
function getTypeSymbol(type: DataType): JSX.Element {
  switch (type) {
    case 'MEASURE':
      return <TiSortNumerically />;
    case 'TIME':
      return <TiCalendar />;
    default:
    case 'DIMENSION':
      return <TiSortAlphabetically />;
  }
}

export default function Pill(props: PillProps) {
  const {
    column,
    inEncoding,
    setEncodingParameter,
    containingField,
    addToNextOpenSlot,
  } = props;
  const [{opacity}, dragRef] = useDrag({
    item: {type: 'CARD', text: column.field},
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });
  return (
    <div className="pill flex" ref={dragRef} style={{opacity}}>
      <div className="fixed-symbol-width">
        {!inEncoding && <GoTriangleDown />}
      </div>
      <div className="fixed-symbol-width">{getTypeSymbol(column.type)}</div>
      <div className="pill-label">{column.field}</div>
      <div className="fixed-symbol-width">{!inEncoding && <TiFilter />}</div>
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
