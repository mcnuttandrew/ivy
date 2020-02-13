import React from 'react';
import {SliderWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget} from './widget-common';

export default function SliderWidgetComponent(
  props: GeneralWidget<TemplateWidget<SliderWidget>>,
): JSX.Element {
  const {widget, idx, setWidgetValue, editMode, templateMap, setTemplateValue} = props;
  const clamp = (v: any): number => Math.max(widget.config.minVal, Math.min(widget.config.maxVal, Number(v)));
  const setVal = (text: any): any => setTemplateValue({field: widget.name, text: `${clamp(text)}`});
  return (
    <div className="slide-widget">
      {!editMode && <div className="widget-title">{widget.displayName || widget.name}</div>}
      {editMode && (
        <div className="flex">
          <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
          <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        </div>
      )}
      <div className="flex">
        <input
          type="number"
          value={templateMap[widget.name]}
          onChange={({target: {value}}): any => setVal(value)}
          step={widget.config.step}
        />
        <div className="flex-down">
          <input
            type="range"
            min={widget.config.minVal}
            max={widget.config.maxVal}
            value={templateMap[widget.name]}
            onChange={(event): any => setVal(event.target.value)}
            step={widget.config.step}
            className="slider"
          />
          <div className="flex space-between">
            {!editMode && <span>{widget.config.minVal}</span>}
            {!editMode && <span>{widget.config.maxVal}</span>}
            {editMode && (
              <input
                value={widget.config.minVal}
                type="number"
                onChange={(event): any => setWidgetValue('minVal', event.target.value, idx)}
              />
            )}
            {editMode && (
              <input
                value={widget.config.maxVal}
                type="number"
                onChange={(event): any => setWidgetValue('maxVal', event.target.value, idx)}
              />
            )}
          </div>
        </div>
        {editMode && (
          <AddLabelToWidget label="Step Size">
            <input
              value={widget.config.step}
              type="number"
              onChange={(event): any => setWidgetValue('step', event.target.value, idx)}
            />
          </AddLabelToWidget>
        )}
      </div>
    </div>
  );
}
