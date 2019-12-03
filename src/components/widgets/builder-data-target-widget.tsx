import React from 'react';
import Switch from 'react-switch';
import Select from 'react-select';
import {DataTargetWidget, TemplateWidget} from '../../constants/templates';
import {DataType} from '../../types';
interface DataTargetBuilderWidgetProps {
  generalWidget: TemplateWidget;
  idx: number;
  setWidgetValue: any;
}

const toSelectFormat = (arr: string[]) =>
  arr.map((x: string) => ({value: x, label: x}));
const DATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME', 'METACOLUMN'];

export default function DataTargetBuilderWidget(
  props: DataTargetBuilderWidgetProps,
) {
  const {generalWidget, idx, setWidgetValue} = props;
  // @ts-ignore
  const widget: DataTargetWidget = generalWidget;
  return (
    <div key={widget.widgetName} className="flex">
      <div className="flex-down">
        <span className="tool-description">WidgetKey</span>
        <input
          value={widget.widgetName}
          onChange={event =>
            setWidgetValue('widgetName', event.target.value, idx)
          }
        />
        <div className="flex">
          <span className="tool-description">Required:</span>
          <Switch
            checked={!!widget.required}
            offColor="#E1E9F2"
            onColor="#36425C"
            height={15}
            checkedIcon={false}
            width={50}
            onChange={() => setWidgetValue('required', !widget.required, idx)}
          />
        </div>
      </div>
      <div className="flex-down">
        <span className="tool-description">Allowed Data Types</span>
        <Select
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
        />
      </div>
    </div>
  );
}
