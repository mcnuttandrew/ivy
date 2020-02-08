import React from 'react';
import {useDrop} from 'react-dnd';

import {GenericAction, SetTemplateValuePayload} from '../../actions/index';
import Pill from '../pill';
import Selector from '../selector';
import {ColumnHeader} from '../../types';
import {classnames, get} from '../../utils';
import {configurationOptions, EncodingOption} from '../../utils/t0';
import {TEXT_TYPE} from '../../constants/index';
import ConfigurationOption from './configuration-option';

interface ShelfProps {
  column?: {field: string; type: string};
  columns: ColumnHeader[];
  disable: boolean;
  field: string;
  spec: any;
  metaColumns: ColumnHeader[];
  onDrop: any;

  setEncodingParameter: GenericAction<SetTemplateValuePayload>;
  setNewSpec: GenericAction<any>;
}

export default function Shelf(props: ShelfProps): JSX.Element {
  const {
    column,
    columns,
    disable,
    field,
    spec,
    metaColumns,
    onDrop,
    setEncodingParameter,
    setNewSpec,
  } = props;

  // copy/pasta for drag and drop
  const [{isOver, canDrop}, drop] = useDrop({
    accept: 'CARD',
    drop: item => {
      return onDrop({...item, field, disable});
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const optionsToRender = (configurationOptions[field] || []).filter((option: EncodingOption) =>
    option.predicate(spec),
  );

  const configurationOpen = Boolean(optionsToRender.length);
  let definedField = columns.find(({field}) => column && field === column.field);
  const repeatKey = get(column, ['field', 'repeat']);
  if (repeatKey && typeof repeatKey === 'string') {
    definedField = metaColumns.find(({field}: {field: string}) => repeatKey === field);
  }
  const options = [{display: 'Select a value', value: null}].concat(
    columns
      .map(({field, type}) => ({
        display: `${field} (${TEXT_TYPE[type]})`,
        value: field,
        group: type,
      }))
      .sort((a, b) => a.display.localeCompare(b.display)),
  );

  const fieldSelector = (
    <Selector
      options={options}
      useGroups={true}
      selectedValue={(definedField && definedField.field) || 'SELECT A VALUE'}
      onChange={(text: string): void => {
        onDrop({field, type: 'CARD', text, disable: false});
      }}
    />
  );

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
              fieldSelector={fieldSelector}
            />
          )}
          {!definedField && <div className="shelf-dropdown">{fieldSelector}</div>}
        </div>
      </div>
      {configurationOpen && (
        <div className="shelf-configuration flex">
          {optionsToRender.map((option: EncodingOption, idx: number) => {
            return (
              <ConfigurationOption
                key={idx}
                option={option}
                spec={spec}
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
