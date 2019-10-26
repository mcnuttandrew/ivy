import React, {useState} from 'react';
import {useDrop} from 'react-dnd';
import {IoIosOptions} from 'react-icons/io';
import {TiDeleteOutline} from 'react-icons/ti';

import {GenericAction} from '../actions/index';
import Pill from './pill';
import Selector from './selector';
import {ColumnHeader} from '../types';
import {configurationOptions, EncodingOption} from '../constants';

interface ShelfProps {
  columns: ColumnHeader[];
  column?: {field: string, type: string};
  field: string;
  onDrop: any;
  iMspec: any;

  setEncodingParameter: GenericAction;
  setNewSpec: GenericAction;
}

export default function Shelf(props: ShelfProps) {
  const {
    field,
    columns,
    column,
    onDrop,
    setEncodingParameter,
    iMspec,
    setNewSpec,
  } = props;

  // copy/pasta for drag and drop
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: item => onDrop({...item, field}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const [configurationOpen, toggleConfiguration] = useState(true);
  const isActive = isOver && canDrop;
  // TODO make these colors not awful
  const backgroundColor = isActive ? 'darkgreen' : canDrop ? 'darkkhaki' : null;
  const definedField = columns.find(
    ({field}) => column && field === column.field,
  );
  return (
    <div ref={drop} className="flex-down shelf-container">
      <div className="shelf flex">
        <div className="field-label flex space-around">
          <div>{field} </div>
          <div
            className="label-control"
            onClick={() => toggleConfiguration(!configurationOpen)}
          >
            <IoIosOptions />
          </div>
        </div>
        <div className="pill-dropzone">
          {!definedField && (
            <div className="blank-pill" style={{backgroundColor}}>
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
          {(configurationOptions[field] || [])
            .filter((option: EncodingOption) => option.predicate(iMspec))
            .map((option: EncodingOption) => {
              const {optionType, options, optionSetter, optionGetter} = option;
              return (
                <div key={optionType} className="option-row flex">
                  {optionType}
                  <div className="flex">
                    <Selector
                      options={options}
                      selectedValue={optionGetter(iMspec) || ''}
                      onChange={(value: any) =>
                        setNewSpec(optionSetter(iMspec, value))
                      }
                    />

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
