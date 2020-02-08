import React from 'react';
import {useDrop} from 'react-dnd';
import {IgnoreKeys} from 'react-hotkeys';

import AllowedTypesList from './allowed-types-list';
import Pill from './pill';
import Selector from './selector';
import {ColumnHeader} from '../types';
import {MultiDataTargetWidget, TemplateWidget, DataType} from '../templates/types';
import {classnames} from '../utils';
import {TEXT_TYPE} from '../constants/index';

interface Props {
  channelEncodings?: string[];
  columns: ColumnHeader[];
  field: string;
  onDrop: any;
  widget: TemplateWidget<MultiDataTargetWidget>;
  setName?: any;
}

export default function TemplateMultiShelf(props: Props): JSX.Element {
  const {channelEncodings, columns, field, onDrop, setName, widget} = props;

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
  const allowed = widget.widget.allowedTypes;
  // if everything is allowed then recomendations dont matter much here
  const useGroupsAsTypes = ['DIMENSION', 'MEASURE', 'TIME'].every((key: DataType) => allowed.includes(key));
  const options = [{display: 'Select a value', value: null, group: null}].concat(
    columns.map(column => ({
      display: `${column.field} ${TEXT_TYPE[column.type]}`,
      value: column.field,
      group: useGroupsAsTypes
        ? column.type
        : widget.widget.allowedTypes.includes(column.type)
        ? 'RECOMENDED'
        : 'OUT OF TYPE',
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
          <AllowedTypesList allowedTypes={allowed} />
          {!setName && <div>{field}</div>}
          {setName && (
            <IgnoreKeys style={{height: '100%'}}>
              <input
                type="text"
                value={widget.widgetName}
                onChange={(event): any => setName(event.target.value)}
              />
            </IgnoreKeys>
          )}
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
                setEncodingParameter={(x: any): void => {
                  onDrop({
                    text: channelEncodings.filter(d => d !== x.column.field),
                    ...dropCommon,
                  });
                }}
                fieldSelector={
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
                }
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
          {!maxValsHit && (
            <div className="flex">
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
