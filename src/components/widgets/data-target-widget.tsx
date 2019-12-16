import React from 'react';
import Switch from 'react-switch';
import Select from 'react-select';
import {DataTargetWidget} from '../../templates/types';
import {DataType} from '../../types';
import {toSelectFormat, trim} from '../../utils';
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
  if (!editMode) {
    const fieldValue = templateMap[widget.widgetName];
    return (
      <div key={widget.widgetName}>
        <TemplateShelf
          channelEncoding={trim(fieldValue as string)}
          field={widget.widgetName}
          columns={columns}
          onDrop={setTemplateValue}
          widget={widget}
        />
      </div>
    );
  }
  return (
    <div className="flex">
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
