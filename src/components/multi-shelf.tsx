import React from 'react';
import {useDrop} from 'react-dnd';

import AllowedTypesList from './allowed-types-list';
import Pill from './pill';
import Selector from './selector';
import {ColumnHeader} from '../types';
import {MultiDataTargetWidget, Widget, DataType, Template} from '../templates/types';
import {classnames, makeOptionsForDropdown, getOrMakeColumn} from '../utils';

interface Props {
  shelfValues?: string[];
  columns: ColumnHeader[];
  fieldKey: string;
  shelfName: string;
  onDrop: any;
  widget: Widget<MultiDataTargetWidget>;
  template: Template;
}

export default function MultiShelf(props: Props): JSX.Element {
  const {shelfValues, columns, shelfName, fieldKey, onDrop, widget, template} = props;

  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: (item: any) =>
      onDrop({
        ...item,
        text: shelfValues.concat([`${item.text}`]),
        field: fieldKey,
        multiTarget: true,
      }),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const allowed = widget.config.allowedTypes;
  // if everything is allowed then recomendations dont matter much here
  const useGroupsAsTypes = ['DIMENSION', 'MEASURE', 'TIME'].every((key: DataType) => allowed.includes(key));
  const options = makeOptionsForDropdown({template, widget, columns, useGroupsAsTypes});

  const columnHeaders = shelfValues
    .map(shelfValue => getOrMakeColumn(shelfValue, columns, template))
    .filter(d => d);
  const maxValsHit = (widget.config.maxNumberOfTargets || Infinity) < columnHeaders.length;
  const dropCommon = {field: fieldKey, multiTarget: true};

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
          <div>{shelfName}</div>
        </div>
        <div className="pill-dropzone">
          {columnHeaders.map((columnHeader, idx: number) => {
            return (
              <Pill
                key={`${columnHeader.field}-${idx}`}
                inEncoding={true}
                containingShelf={shelfName}
                containingField={shelfName}
                column={columnHeader}
                setParam={(x: any): void => {
                  onDrop({
                    text: shelfValues.filter(d => d !== x.column.field),
                    ...dropCommon,
                  });
                }}
                fieldSelector={
                  <Selector
                    useGroups={true}
                    options={options}
                    selectedValue={columnHeader.field || ' '}
                    onChange={(text: string): void => {
                      const newColumns = [...shelfValues];
                      newColumns[idx] = `${text}`;
                      onDrop({text: newColumns, ...dropCommon});
                    }}
                  />
                }
              />
            );
          })}
          {!maxValsHit && (
            <div className={classnames({'blank-pill': true, 'highlight-drop': isOver || canDrop})}>
              {'drop a field here'}
            </div>
          )}
          {!maxValsHit && (
            <div className="flex">
              <button onClick={(): any => onDrop({field: fieldKey, text: []})}>Clear</button>
              <Selector
                useGroups={true}
                options={options.filter(d => !shelfValues.includes(d.value))}
                selectedValue={' '}
                onChange={(x: any): void => {
                  onDrop({text: shelfValues.concat([`${x}`]), ...dropCommon});
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
