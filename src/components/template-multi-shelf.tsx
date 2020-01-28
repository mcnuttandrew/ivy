import React from 'react';
import {useDrop} from 'react-dnd';
import {TiDeleteOutline} from 'react-icons/ti';

import DataSymbol from './data-symbol';
import Pill from './pill';
import Selector from './selector';
import {ColumnHeader} from '../types';
import {MultiDataTargetWidget, TemplateWidget} from '../templates/types';
import {classnames} from '../utils';
import {TEXT_TYPE} from '../constants/index';

interface Props {
  channelEncodings?: string[];
  columns: ColumnHeader[];
  field: string;
  onDrop: any;
  widget: TemplateWidget<MultiDataTargetWidget>;
  showSimpleDisplay: boolean;
  setName?: any;
}

export default function TemplateMultiShelf(props: Props): JSX.Element {
  const {channelEncodings, columns, field, onDrop, setName, showSimpleDisplay, widget} = props;

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
  const options = [{display: 'Select a value', value: null, group: null}].concat(
    columns.map(column => ({
      display: `${column.field} ${TEXT_TYPE[column.type]}`,
      value: column.field,
      group: widget.widget.allowedTypes.includes(column.type) ? 'RECOMENDED' : 'OUT OF TYPE',
    })),
  );
  const columnHeaders = channelEncodings
    .map(channelEncoding => columns.find(({field}) => channelEncoding && field === channelEncoding))
    .filter(d => d);
  const maxValsHit = (widget.widget.maxNumberOfTargets || Infinity) < columnHeaders.length;
  const dropCommon = {field, multiTarget: true};
  return (
    <div
      ref={drop}
      className={classnames({
        'flex-down': true,
        'multi-shelf-container': true,
      })}
    >
      <div className="multi-shelf flex">
        <div className="field-label flex-down space-around">
          {!setName && <div>{field}</div>}
          {setName && (
            <input
              type="text"
              value={widget.widgetName}
              onChange={(event): any => setName(event.target.value)}
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
            if (showSimpleDisplay) {
              return (
                <div className="shelf-dropdown flex" key={`${columnHeader.field}-${idx}`}>
                  <Selector
                    useGroups={true}
                    options={options}
                    selectedValue={columnHeader.field || ' '}
                    onChange={(text: string): void => {
                      const newColumns = [...channelEncodings];
                      newColumns[idx] = `${text}`;
                      onDrop({text: newColumns, ...dropCommon});
                    }}
                  />
                  <div
                    className="cursor-pointer"
                    onClick={(): void => {
                      const newColumns = channelEncodings.filter(d => d !== columnHeader.field);
                      onDrop({text: newColumns, ...dropCommon});
                    }}
                  >
                    <TiDeleteOutline />
                  </div>
                </div>
              );
            }
            return (
              <Pill
                key={`${columnHeader.field}-${idx}`}
                inEncoding={true}
                containingShelf={field}
                containingField={field}
                column={columnHeader}
                setEncodingParameter={(x: any): void => {
                  onDrop({
                    text: channelEncodings.filter(d => d !== x.column.field),
                    ...dropCommon,
                  });
                }}
              />
            );
          })}
          {!maxValsHit && !showSimpleDisplay && (
            <div
              className={classnames({
                'blank-pill': true,
                'highlight-drop': isOver || canDrop,
              })}
            >
              {'drop a field here'}
            </div>
          )}
          {!maxValsHit && showSimpleDisplay && (
            <div className={classnames({flex: true})}>
              <div>Add a new field</div>
              <Selector
                useGroups={true}
                options={options.filter(d => !channelEncodings.includes(d.value))}
                selectedValue={' '}
                onChange={(x: any): void => {
                  onDrop({
                    text: channelEncodings.concat([`${x}`]),
                    ...dropCommon,
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
