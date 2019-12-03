import React from 'react';
import CreatableSelect from 'react-select/creatable';
import {ListWidget, TemplateWidget} from '../../constants/templates';
import Select from 'react-select';
interface ListBuilderWidgetProps {
  generalWidget: TemplateWidget;
  idx: number;
  setWidgetValue: any;
}
const toSelectFormat = (arr: string[]) =>
  arr.map((x: string) => ({value: x, label: x}));

export default function ListBuilderWidget(props: ListBuilderWidgetProps) {
  const {generalWidget, idx, setWidgetValue} = props;
  // @ts-ignore
  const widget: ListWidget = generalWidget;
  return (
    <div key={widget.widgetName}>
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
