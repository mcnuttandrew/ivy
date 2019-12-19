import React from 'react';
import {SliderWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';

export default function SliderWidget(
  props: GeneralWidget<TemplateWidget<SliderWidget>>,
) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    setTemplateValue,
  } = props;
  const clamp = (v: any) =>
    Math.max(widget.widget.minVal, Math.min(widget.widget.maxVal, Number(v)));
  const setVal = (text: any) =>
    setTemplateValue({field: widget.widgetName, text: clamp(text)});
  return (
    <div className="slide-widget">
      {!editMode && <div>{widget.widgetName}</div>}
      {editMode && (
        <input
          value={widget.widgetName}
          type="text"
          onChange={event =>
            setWidgetValue('widgetName', event.target.value, idx)
          }
        />
      )}
      <div className="flex">
        <input
          type="number"
          value={templateMap[widget.widgetName]}
          onChange={({target: {value}}) => setVal(value)}
        />
        <div className="flex-down">
          <input
            type="range"
            min={widget.widget.minVal}
            max={widget.widget.maxVal}
            value={templateMap[widget.widgetName]}
            onChange={event => setVal(event.target.value)}
            step={widget.widget.step}
            className="slider"
          />
          <div className="flex space-between">
            {!editMode && <span>{widget.widget.minVal}</span>}
            {!editMode && <span>{widget.widget.maxVal}</span>}
            {editMode && (
              <input
                value={widget.widget.minVal}
                type="number"
                onChange={event =>
                  setWidgetValue('minVal', event.target.value, idx)
                }
              />
            )}
            {editMode && (
              <input
                value={widget.widget.maxVal}
                type="number"
                onChange={event =>
                  setWidgetValue('maxVal', event.target.value, idx)
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
