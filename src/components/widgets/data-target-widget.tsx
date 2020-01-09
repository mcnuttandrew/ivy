import React from 'react';
import {DataTargetWidget, TemplateWidget} from '../../templates/types';
import {DataType} from '../../types';
import {trim} from '../../utils';
import DataSymbol from '../data-symbol';
import {GeneralWidget} from './general-widget';
import TemplateShelf from '../template-shelf';

const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];

export default function DataTargetWidget(
  props: GeneralWidget<TemplateWidget<DataTargetWidget>>,
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
  const allowedTypesSet = new Set(widget.widget.allowedTypes);

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
          <span className="tool-description">Data Types</span>
          <div className="flex">
            {DATA_TYPES.map(type => {
              const checked = allowedTypesSet.has(type);
              return (
                <div className="flex" key={type} style={{marginRight: '10px'}}>
                  <div>
                    <DataSymbol type={type} />
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={event => {
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
            onChange={() =>
              setWidgetValue('required', !widget.widget.required, idx)
            }
            checked={!!widget.widget.required}
          />
        </div>
      </div>
    </div>
  );
}