import React from 'react';
import {SliderWidget} from '../../constants/templates';
interface SliderBuilderWidgetProps {
  widget: SliderWidget;
  idx: number;
  setWidgetValue: any;
}

export default function SliderBuilderWidget(props: SliderBuilderWidgetProps) {
  const {widget, idx, setWidgetValue} = props;
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
      </div>
      <div className="flex-down">
        <div className="flex">
          <div className="flex-down">
            <span className="tool-description">Min </span>
            <input
              value={widget.minVal}
              onChange={event =>
                setWidgetValue('minVal', event.target.value, idx)
              }
            />
          </div>
          <div className="flex-down">
            <span className="tool-description">Max</span>
            <input
              value={widget.maxVal}
              onChange={event =>
                setWidgetValue('maxVal', event.target.value, idx)
              }
            />
          </div>
        </div>
        <div className="flex">
          <div className="flex-down">
            <span className="tool-description">Step Size</span>
            <input
              value={widget.step}
              onChange={event =>
                setWidgetValue('step', event.target.value, idx)
              }
            />
          </div>
          <div className="flex-down">
            <span className="tool-description">Default Value</span>
            <input
              value={widget.defaultValue}
              onChange={event =>
                setWidgetValue('defaultValue', event.target.value, idx)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
