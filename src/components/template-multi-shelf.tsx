import React from 'react';
import {useDrop} from 'react-dnd';
import {MultiDataTargetWidget, TemplateWidget} from '../templates/types';

import DataSymbol from './data-symbol';
import Pill from './pill';
import {ColumnHeader} from '../types';
import {classnames} from '../utils';

interface Props {
  channelEncodings?: string[];
  columns: ColumnHeader[];
  field: string;
  onDrop: any;
  widget: TemplateWidget<MultiDataTargetWidget>;
  setName?: any;
}

export default function TemplateMultiShelf(props: Props) {
  const {channelEncodings, columns, field, onDrop, widget, setName} = props;

  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: (item: any) =>
      onDrop({
        ...item,
        text: channelEncodings.concat([`${item.text}`]),
        field,
        multiTarget: true,
      }),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const columnHeaders = channelEncodings
    .map(channelEncoding =>
      columns.find(({field}) => channelEncoding && field === channelEncoding),
    )
    .filter(d => d);
  const maxValsHit =
    (widget.widget.maxNumberOfTargets || Infinity) < columnHeaders.length;
  return (
    <div
      ref={drop}
      className={classnames({
        'flex-down': true,
        'multi-shelf-container': true,
      })}
    >
      <div className="multi-shelf flex-down">
        <div className="field-label flex space-around">
          {!setName && <div>{field}</div>}
          {setName && (
            <input
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
        <div className="pill-dropzone">
          {columnHeaders.map((columnHeader, idx: number) => {
            return (
              <Pill
                key={`${columnHeader.field}-${idx}`}
                inEncoding={true}
                containingShelf={field}
                containingField={field}
                column={columnHeader}
                setEncodingParameter={(x: any) => {
                  const text = channelEncodings.filter(
                    d => d !== x.column.field,
                  );
                  onDrop({text, field, multiTarget: true});
                }}
              />
            );
          })}
          {!maxValsHit && (
            <div
              className={classnames({
                'blank-pill': true,
                'highlight-drop': isOver || canDrop,
              })}
            >
              {'drop a field here'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
