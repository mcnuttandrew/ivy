import React from 'react';
import {SliderWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget, widgetName} from './widget-common';

function SliderWidgetConfiguration(props: GeneralWidget<SliderWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div className="flex-down">
      <div className="flex">
        <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
      </div>
      <div className="flex">
        <AddLabelToWidget label="min value">
          <input
            value={widget.config.minVal}
            type="number"
            onChange={(event): any => setWidgetValue('minVal', event.target.value, idx)}
          />
        </AddLabelToWidget>
        <AddLabelToWidget label="max value">
          <input
            value={widget.config.maxVal}
            type="number"
            onChange={(event): any => setWidgetValue('maxVal', event.target.value, idx)}
          />
        </AddLabelToWidget>
        <AddLabelToWidget label="Step Size">
          <input
            value={widget.config.step}
            type="number"
            onChange={(event): any => setWidgetValue('step', event.target.value, idx)}
          />
        </AddLabelToWidget>
      </div>
    </div>
  );
}

function SliderWidgetComponent(props: GeneralWidget<SliderWidget>): JSX.Element {
  const {widget, templateMap, setTemplateValue, editMode} = props;
  const clamp = (v: any): number => Math.max(widget.config.minVal, Math.min(widget.config.maxVal, Number(v)));
  const setVal = (text: any): any => setTemplateValue({field: widget.name, text: `${clamp(text)}`});
  return (
    <div className="slide-widget">
      <div className="widget-title">{widgetName(widget, editMode)}</div>
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
            <span>{widget.config.minVal}</span>
            <span>{widget.config.maxVal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const SliderBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as TemplateWidget<SliderWidget>;
  return {
    controls: <SliderWidgetConfiguration {...common} widget={widg} />,
    uiElement: <SliderWidgetComponent {...common} widget={widg} />,
  };
};
export default SliderBuilder;
