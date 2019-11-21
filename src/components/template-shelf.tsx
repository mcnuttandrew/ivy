import React from 'react';
import {GenericAction} from '../actions/index';
import {useDrop} from 'react-dnd';

import Pill from './pill';
import {ColumnHeader} from '../types';
import {classnames, get} from '../utils';

interface TemplateShlef {
  channelEncoding?: string;
  columns: ColumnHeader[];
  field: string;
  onDrop: GenericAction;
}

export default function TemplateShelf(props: TemplateShlef) {
  const {channelEncoding, columns, field, onDrop} = props;

  // copy/pasta for drag and drop
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: item => onDrop({...item, field}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const columnHeader = columns.find(
    ({field}) => channelEncoding && field === channelEncoding,
  );
  return (
    <div
      ref={drop}
      className={classnames({
        'flex-down': true,
        'shelf-container': true,
      })}
    >
      <div className="shelf flex">
        <div className="field-label flex space-around">
          <div>{field}</div>
        </div>
        <div className="pill-dropzone">
          {!columnHeader && (
            <div
              className={classnames({
                'blank-pill': true,
                'highlight-drop': isOver || canDrop,
              })}
            >
              {'drop a field here'}
            </div>
          )}
          {channelEncoding && columnHeader && (
            <Pill
              inEncoding={true}
              containingShelf={field}
              containingField={field}
              column={columnHeader}
              setEncodingParameter={onDrop}
            />
          )}
        </div>
      </div>
    </div>
  );
}