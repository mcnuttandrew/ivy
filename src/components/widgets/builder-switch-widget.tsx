import React from 'react';
import Switch from 'react-switch';
import {SwitchWidget} from '../../templates/types';
interface SwitchBuilderWidgetProps {
  widget: SwitchWidget;
  idx: number;
  setWidgetValue: any;
}

export default function SwitchBuilderWidget(props: SwitchBuilderWidgetProps) {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div key={widget.widgetName} className="flex">
      <div className="flex-down">
        <div className="flex-down">
          <span className="tool-description">WidgetKey</span>
          <input
            value={widget.widgetName}
            onChange={event =>
              setWidgetValue('widgetName', event.target.value, idx)
            }
          />
        </div>
        <div className="flex">
          <span>Defaults to be </span>
          <Switch
            checked={!!widget.defaultsToActive}
            offColor="#E1E9F2"
            onColor="#36425C"
            height={15}
            checkedIcon={false}
            width={50}
            onChange={() =>
              setWidgetValue('defaultValue', !widget.defaultsToActive, idx)
            }
          />
        </div>
      </div>
      <div className="flex-down">
        <span className="tool-description">Active Value</span>
        <input
          value={widget.activeValue}
          onChange={event =>
            setWidgetValue('activeValue', event.target.value, idx)
          }
        />
      </div>
      <div className="flex-down">
        <span className="tool-description">Inactive Value</span>
        <input
          value={widget.inactiveValue}
          onChange={event =>
            setWidgetValue('inactiveValue', event.target.value, idx)
          }
        />
      </div>
    </div>
  );
}
