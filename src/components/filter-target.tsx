import React from 'react';
import {useDrop} from 'react-dnd';

import {classnames} from '../utils';

interface FilterTargetProps {
  onDrop: any;
}

export default function FilterTarget({onDrop}: FilterTargetProps): JSX.Element {
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: item => onDrop({...item}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div ref={drop} className="filter-target flex shelf">
      <div className="pill-dropzone">
        <div
          className={classnames({
            'blank-pill': true,
            'highlight-drop': isOver || canDrop,
          })}
        >
          {'drop a field here'}
        </div>
      </div>
    </div>
  );
}
