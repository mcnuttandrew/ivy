import React, {useState} from 'react';
import {useDrop} from 'react-dnd';
import {IoIosOptions} from 'react-icons/io';
import {TiDeleteOutline} from 'react-icons/ti';
import {GenericAction} from '../actions/index';
import Pill from './pill';
import {ColumnHeader} from '../types';
import {configurationOptions} from '../constants';

interface ShelfProps {
  field: string;
  columns: ColumnHeader[];
  currentField?: {field: string, type: string};
  onDrop: any;
  setEncodingParameter: GenericAction;
  spec: any;
}

export default function Shelf({
  field,
  columns,
  currentField,
  onDrop,
  setEncodingParameter,
  spec,
}: ShelfProps) {
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: item => onDrop({...item, field}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // TODO, make field that are new changed pop open
  const [configurationOpen, toggleConfiguration] = useState(false);
  const isActive = isOver && canDrop;
  const backgroundColor = isActive ? 'darkgreen' : canDrop ? 'darkkhaki' : null;
  const definedField = columns.find(
    ({field}) => currentField && field === currentField.field,
  );
  return (
    <div ref={drop} className="flex-down shelf-container">
      <div className="shelf flex">
        <div className="field-label">
          {field}{' '}
          <div onClick={() => toggleConfiguration(!configurationOpen)}>
            <IoIosOptions />
          </div>
        </div>
        <div className="pill-dropzone">
          {!definedField && (
            <div className="blank-pill" style={{backgroundColor}}>
              {'drop a field here'}
            </div>
          )}
          {currentField && definedField && (
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
        <div className="shelf-configuration">
          {(configurationOptions[field]
            ? Object.entries(configurationOptions[field])
            : []
          ).map(([optionType, options]: [any, any]) => {
            return (
              <div key={optionType} className="option-row flex">
                {optionType}
                <div className="flex">
                  <select
                    value={spec.encoding[field][optionType]}
                    onChange={({target: {value}}) => console.log(value)}
                  >
                    {options.map((option: string) => (
                      <option value={option} key={`${optionType}-${option}`}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="clear-option">
                    <TiDeleteOutline />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
