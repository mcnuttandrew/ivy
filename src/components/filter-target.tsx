import React from 'react';
import {useDrop} from 'react-dnd';
import {TiPlus} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';
import {ColumnHeader} from '../types';

import {classnames} from '../utils';

interface FilterTargetProps {
  columns: ColumnHeader[];
  onDrop: any;
}

export default function FilterTarget({onDrop, columns}: FilterTargetProps): JSX.Element {
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
        <div className={classnames({'blank-pill': true, 'highlight-drop': isOver || canDrop})}>
          drop a field here
        </div>
      </div>
      <Tooltip
        placement="top"
        trigger="click"
        overlay={
          <div className="tooltip-internal flex-down">
            <h3>Add a filter</h3>
            <div>
              {columns.map(column => (
                <button key={column.field} onClick={(): void => onDrop({text: column.field})}>
                  {column.field}
                </button>
              ))}
            </div>
          </div>
        }
      >
        <div className="cursor-pointer">
          <TiPlus />
        </div>
      </Tooltip>
    </div>
  );
}
