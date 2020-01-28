import React from 'react';
import {useDrop} from 'react-dnd';

import Pill from './pill';
import Selector from './selector';
import DataSymbol from './data-symbol';
import {ColumnHeader} from '../types';
import {DataTargetWidget, TemplateWidget} from '../templates/types';
import {classnames} from '../utils';
import {TEXT_TYPE} from '../constants/index';

interface TemplateShelf {
  channelEncoding?: string;
  columns: ColumnHeader[];
  field: string;
  onDrop: any;
  setName?: any;
  widget: TemplateWidget<DataTargetWidget>;
}

export default function TemplateShelf(props: TemplateShelf): JSX.Element {
  const {channelEncoding, columns, field, onDrop, setName, widget} = props;
  // copy/pasta for drag and drop
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: (item: any) => onDrop({...item, text: `"${item.text}"`, field}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const options = [{display: 'Select a value', value: null, group: null}].concat(
    columns
      .map(column => ({
        display: `${column.field} ${TEXT_TYPE[column.type]}`,
        value: column.field,
        group: widget.widget.allowedTypes.includes(column.type) ? 'RECOMENDED' : 'OUT OF TYPE',
      }))
      .sort((a, b) => a.display.localeCompare(b.display)),
  );

  const columnHeader = columns.find(({field}) => channelEncoding && field === channelEncoding);
  const fieldSelector = (
    <Selector
      useGroups={true}
      options={options}
      selectedValue={channelEncoding || ' '}
      onChange={(text: string): void => {
        onDrop({field, type: 'CARD', text: `"${text}"`, disable: false});
      }}
    />
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
          {!setName && <div className="flex">{field}</div>}
          {setName && (
            <input
              type="text"
              value={widget.widgetName}
              onChange={(event): any => setName(event.target.value)}
            />
          )}
          <div className="flex data-type-container">
            {widget.widget.allowedTypes.map(type => {
              return (
                <div
                  className={classnames({
                    [`${type.toLowerCase()}-pill`]: true,
                    'symbol-box': true,
                  })}
                  key={type}
                />
              );
            })}
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
              fieldSelector={fieldSelector}
            />
          )}
          {!channelEncoding && !columnHeader && fieldSelector}
        </div>
      </div>
    </div>
  );
}
