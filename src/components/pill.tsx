import React from 'react';
import {GenericAction} from '../actions/index';
import {useDrag} from 'react-dnd';
import {ColumnHeader, DataType} from '../types';

export interface PillProps {
  column: ColumnHeader;
  containingField?: string;
  inEncoding: boolean;
  setEncodingParameter?: GenericAction;
}
function getTypeSymbol(type: DataType): string {
  switch (type) {
    case 'MEASURE':
      return '#';
    // case 'TIME':
    //   return 'T';
    default:
    case 'DIMENSION':
      return 'A';
  }
}

export default function Pill(props: PillProps) {
  const {column, inEncoding, setEncodingParameter, containingField} = props;
  const [{opacity}, dragRef] = useDrag({
    item: {type: 'CARD', text: column.field},
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });
  return (
    <div className="shelf flex" ref={dragRef} style={{opacity}}>
      {!inEncoding && <div>^</div>}
      <div>{getTypeSymbol(column.type)}</div>
      <div>{column.field}</div>
      {!inEncoding && <div>Filt</div>}
      {!inEncoding && <div>+</div>}
      {inEncoding && (
        <div
          onClick={() =>
            setEncodingParameter({text: null, field: containingField})
          }
        >
          X
        </div>
      )}
    </div>
  );
}
