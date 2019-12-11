import React from 'react';
import CreatableSelect from 'react-select/creatable';
import {ListWidget} from '../../templates/types';
import {toSelectFormat} from '../../utils';
import Select from 'react-select';
interface ListBuilderWidgetProps {
  widget: ListWidget;
  idx: number;
  setWidgetValue: any;
}

export default function ListBuilderWidget(props: ListBuilderWidgetProps) {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div>
      <div className="flex">
        <div className="flex-down">
          <span className="tool-description">WidgetKey</span>
          <input
            value={widget.widgetName}
            onChange={event =>
              setWidgetValue('widgetName', event.target.value, idx)
            }
          />
        </div>
        <div className="flex-down full-width">
          <span className="tool-description"> Default value </span>
          <Select
            classNamePrefix="hydra-import-select"
            onChange={(x: any) => setWidgetValue('defaultValue', x.value, idx)}
            options={toSelectFormat(widget.allowedValues.map(d => d.value))}
          />
        </div>
      </div>
      <div className="flex-down">
        <span className="tool-description"> Options </span>
        <CreatableSelect
          isMulti
          classNamePrefix="hydra-import-select"
          onChange={(x: any) => {
            const updatedValues = x
              .map((row: any) => row.label)
              .map((row: any) => ({display: row, value: row}));
            setWidgetValue('allowedValues', updatedValues, idx);
          }}
          options={widget.allowedValues}
        />
      </div>
    </div>
  );
}
