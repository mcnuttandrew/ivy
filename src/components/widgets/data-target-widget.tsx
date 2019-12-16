import React from 'react';
import Switch from 'react-switch';
import Select from 'react-select';
import {DataTargetWidget} from '../../templates/types';
import {DataType} from '../../types';
import {toSelectFormat, trim} from '../../utils';
import DataSymbol from '../data-symbol';
import {GeneralWidget} from './general-widget';
import TemplateShelf from '../template-shelf';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'];

export default function DataTargetBuilderWidget(
  props: GeneralWidget<DataTargetWidget>,
) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    columns,
    setTemplateValue,
  } = props;
  const fieldValue = templateMap[widget.widgetName];
  if (!editMode) {
    return (
      <TemplateShelf
        channelEncoding={trim(fieldValue as string)}
        field={widget.widgetName}
        columns={columns}
        onDrop={setTemplateValue}
        widget={widget}
      />
    );
  }
  const allowedTypesSet = new Set(widget.allowedTypes);

  return (
    <div className="flex-down">
      <TemplateShelf
        channelEncoding={trim(fieldValue as string)}
        field={widget.widgetName}
        columns={columns}
        onDrop={setTemplateValue}
        widget={widget}
        setName={(value: string) => setWidgetValue('widgetName', value, idx)}
      />
      <div className="flex space-evenly">
        <div className="flex-down">
          <span className="tool-description">Allowed Data Types</span>
          <div className="flex">
            {DATA_TYPES.map(type => {
              const checked = allowedTypesSet.has(type);
              return (
                <div className="flex" key={type}>
                  <DataSymbol type={type} />
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) {
                        allowedTypesSet.delete(type);
                      } else {
                        allowedTypesSet.add(type);
                      }

                      setWidgetValue(
                        'allowedTypes',
                        Array.from(allowedTypesSet),
                        idx,
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex">
          <span className="tool-description">Required:</span>
          <input
            type="checkbox"
            onChange={() => setWidgetValue('required', !widget.required, idx)}
            checked={!!widget.required}
          />
        </div>
        {/* <Select
          isMulti={true}
          value={toSelectFormat(widget.allowedTypes)}
          options={toSelectFormat(DATA_TYPES)}
          classNamePrefix="hydra-import-select"
          onChange={(actionResult: any) => {
            setWidgetValue(
              'allowedTypes',
              (actionResult || []).map((d: any) => d.value),
              idx,
            );
          }}
        /> */}
      </div>
    </div>
  );
}
