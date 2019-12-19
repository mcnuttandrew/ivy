import React from 'react';
import {useDrop} from 'react-dnd';

import Pill from './pill';
import DataSymbol from './data-symbol';
import {ColumnHeader} from '../types';
import {DataTargetWidget, TemplateWidget} from '../templates/types';
import {classnames} from '../utils';

interface TemplateShelf {
  channelEncoding?: string;
  columns: ColumnHeader[];
  field: string;
  onDrop: any;
  setName?: any;
  widget: TemplateWidget<DataTargetWidget>;
}

export default function TemplateShelf(props: TemplateShelf) {
  const {channelEncoding, columns, field, onDrop, widget, setName} = props;

  // copy/pasta for drag and drop
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: (item: any) => onDrop({...item, text: `"${item.text}"`, field}),
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
          <div className="flex-down">
            {!setName && <div>{field}</div>}
            {setName && (
              <input
                type="text"
                value={widget.widgetName}
                onChange={event => setName(event.target.value)}
              />
            )}
            <div className="flex">
              {widget.widget.allowedTypes.map(type => {
                return <DataSymbol type={type} key={type} />;
              })}
            </div>
          </div>
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
