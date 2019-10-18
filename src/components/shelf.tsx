import React from 'react';
import {useDrop} from 'react-dnd';
import {GenericAction} from '../actions/index';
import Pill from './pill';
import {ColumnHeader} from '../types';

interface ShelfProps {
  field: string;
  columns: ColumnHeader[];
  currentField?: {field: string, type: string};
  onDrop: any;
  setEncodingParameter: GenericAction;
}

export default function Shelf({
  field,
  columns,
  currentField,
  onDrop,
  setEncodingParameter,
}: ShelfProps) {
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: item => onDrop({...item, field}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  let backgroundColor = null;
  if (isActive) {
    backgroundColor = 'darkgreen';
  } else if (canDrop) {
    backgroundColor = 'darkkhaki';
  }

  return (
    <div ref={drop} className="shelf flex">
      <div className="field-label">{field}</div>
      <div className="pill-dropzone">
        {!currentField && (
          <div className="blank-pill" style={{backgroundColor}}>
            {'drop a field here'}
          </div>
        )}
        {currentField && (
          <Pill
            inEncoding={true}
            setEncodingParameter={setEncodingParameter}
            containingField={field}
            column={columns.find(({field}) => field === currentField.field)}
          />
        )}
      </div>
    </div>
  );
}
