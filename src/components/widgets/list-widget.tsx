import React from 'react';
import CreatableSelect from 'react-select/creatable';
import {ListWidget} from '../../templates/types';
import {toSelectFormat} from '../../utils';
import Select from 'react-select';
import Selector from '../selector';

import {GeneralWidget} from './general-widget';

export default function ListBuilderWidget(props: GeneralWidget<ListWidget>) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    setTemplateValue,
  } = props;
  const options = toSelectFormat(widget.allowedValues.map(d => d.value));
  if (!editMode) {
    return (
      <div key={widget.widgetName} className="list-widget">
        <div>{widget.widgetName}</div>
        <Selector
          options={widget.allowedValues}
          selectedValue={templateMap[widget.widgetName]}
          onChange={(value: any) => {
            setTemplateValue({field: widget.widgetName, text: value});
          }}
        />
      </div>
    );
  }
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
            options={options}
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
          options={options}
        />
      </div>
    </div>
  );
}
