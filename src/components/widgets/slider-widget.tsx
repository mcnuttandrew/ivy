import React from 'react';
import {SliderWidget, Widget} from '../../types';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget, widgetName, Reset} from './widget-common';
import debounce from 'lodash.debounce';

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
            aria-label={`Min val`}
            value={widget.config.minVal}
            type="number"
            onChange={(event): any => setWidgetValue('minVal', event.target.value, idx)}
          />
        </AddLabelToWidget>
        <AddLabelToWidget label="max value">
          <input
            aria-label={`Max val`}
            value={widget.config.maxVal}
            type="number"
            onChange={(event): any => setWidgetValue('maxVal', event.target.value, idx)}
          />
        </AddLabelToWidget>
      </div>
      <div className="flex">
        <AddLabelToWidget label="Step Size">
          <input
            aria-label={`Step size`}
            value={widget.config.step}
            type="number"
            onChange={(event): any => setWidgetValue('step', event.target.value, idx)}
          />
        </AddLabelToWidget>
        <AddLabelToWidget label="Default Value">
          <input
            aria-label={`Default value`}
            value={widget.config.defaultValue}
            type="number"
            onChange={(event): any => setWidgetValue('defaultValue', event.target.value, idx)}
          />
        </AddLabelToWidget>
      </div>
    </div>
  );
}

function SliderWidgetComponent(props: GeneralWidget<SliderWidget>): JSX.Element {
  const {widget, templateMap, setTemplateValue, editMode} = props;
  const clamp = (v: any): number => Math.max(widget.config.minVal, Math.min(widget.config.maxVal, Number(v)));
  const setVal = debounce(
    (text: any): any => setTemplateValue({field: widget.name, text: `${clamp(text)}`}),
    75,
  );
  return (
    <div className="slide-widget">
      <div className="widget-title">{widgetName(widget, editMode)}</div>
      <div className="flex">
        <input
          aria-label={`Current value`}
          type="number"
          value={templateMap.paramValues[widget.name]}
          onChange={({target: {value}}): any => setVal(value)}
          step={widget.config.step}
        />
        <div className="flex-down">
          <input
            aria-label={`Current value slider`}
            type="range"
            min={widget.config.minVal}
            max={widget.config.maxVal}
            value={templateMap.paramValues[widget.name]}
            onChange={({target: {value}}): any => setVal(value)}
            step={widget.config.step}
            className="slider"
          />
          <div className="flex space-between">
            <span>{widget.config.minVal}</span>
            <span>{widget.config.maxVal}</span>
          </div>
        </div>
        <Reset
          tooltipLabel={'Reset to default value'}
          direction="left"
          onClick={(): any => setVal(widget.config.defaultValue)}
        />
      </div>
    </div>
  );
}

const SliderBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as Widget<SliderWidget>;
  return {
    controls: <SliderWidgetConfiguration {...common} widget={widg} />,
    uiElement: <SliderWidgetComponent {...common} widget={widg} />,
    materializationOptions: (): {name: string; group?: string}[] => [],
  };
};
export default SliderBuilder;
