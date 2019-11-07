import React from 'react';
import {useDrop} from 'react-dnd';
import {TiDeleteOutline} from 'react-icons/ti';

import {GenericAction} from '../actions/index';
import Pill from './pill';
import Selector from './selector';
import {ColumnHeader} from '../types';
import {classnames, get} from '../utils';
import {configurationOptions, EncodingOption} from '../constants';
import ConfigurationOption from './configuration-option';

interface ShelfProps {
  column?: {field: string, type: string};
  columns: ColumnHeader[];
  disable: boolean;
  field: string;
  iMspec: any;
  metaColumns: ColumnHeader[];
  onDrop: any;

  setEncodingParameter: GenericAction;
  setNewSpec: GenericAction;
}

export default function Shelf(props: ShelfProps) {
  const {
    column,
    columns,
    disable,
    field,
    iMspec,
    metaColumns,
    onDrop,
    setEncodingParameter,
    setNewSpec,
  } = props;

  // copy/pasta for drag and drop
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: item => onDrop({...item, field, disable}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const optionsToRender = (configurationOptions[field] || []).filter(
    (option: EncodingOption) => option.predicate(iMspec),
  );

  const configurationOpen = Boolean(optionsToRender.length);
  let definedField = columns.find(
    ({field}) => column && field === column.field,
  );
  const repeatKey = get(column, ['field', 'repeat']);
  if (repeatKey && typeof repeatKey === 'string') {
    definedField = metaColumns.find(
      ({field}: {field: string}) => repeatKey === field,
    );
  }
  return (
    <div
      ref={drop}
      className={classnames({
        'flex-down': true,
        'shelf-container': true,
        'disable-shelf': disable,
      })}
    >
      <div className="shelf flex">
        <div className="field-label flex space-around">
          <div>{field}</div>
        </div>
        <div className="pill-dropzone">
          {!definedField && (
            <div
              className={classnames({
                'blank-pill': true,
                'highlight-drop': !disable && (isOver || canDrop),
              })}
            >
              {'drop a field here'}
            </div>
          )}
          {column && definedField && (
            <Pill
              inEncoding={true}
              containingShelf={field}
              setEncodingParameter={setEncodingParameter}
              containingField={field}
              column={definedField}
            />
          )}
        </div>
      </div>
      {configurationOpen && (
        <div className="shelf-configuration flex-down">
          {optionsToRender.map((option: EncodingOption, idx: number) => {
            return (
              <ConfigurationOption
                key={idx}
                option={option}
                iMspec={iMspec}
                setEncodingParameter={setEncodingParameter}
                setNewSpec={setNewSpec}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
