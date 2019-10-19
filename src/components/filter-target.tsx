import React from 'react';
import {useDrop} from 'react-dnd';

interface FilterTargetProps {
  onDrop: any;
}

export default function FilterTarget({onDrop}: FilterTargetProps) {
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: item => onDrop({...item}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  const backgroundColor = isActive ? 'darkgreen' : canDrop ? 'darkkhaki' : null;

  return (
    <div ref={drop} className="filter-target flex shelf">
      <div className="pill-dropzone">
        <div className="blank-pill" style={{backgroundColor}}>
          {'drop a field here'}
        </div>
      </div>
    </div>
  );
}
