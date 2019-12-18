import React from 'react';
import Switch from 'react-switch';
import {SwitchWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';

export default function SwitchWidget(props: GeneralWidget<SwitchWidget>) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    setTemplateValue,
  } = props;
  const isActive = templateMap[widget.widgetName] === widget.activeValue;

  return (
    <div className="flex-down switch-widget">
      <div className="flex-down">
        <div className="flex space-between">
          {editMode && (
            <input
              value={widget.widgetName}
              onChange={event =>
                setWidgetValue('widgetName', event.target.value, idx)
              }
            />
          )}
          {!editMode && <div>{widget.widgetName}</div>}
          <Switch
            checked={isActive}
            offColor="#E1E9F2"
            onColor="#36425C"
            height={15}
            checkedIcon={false}
            width={50}
            onChange={() =>
              setTemplateValue({
                field: widget.widgetName,
                text: isActive ? widget.inactiveValue : widget.activeValue,
              })
            }
          />
        </div>
      </div>
      {editMode && (
        <div className="flex-down">
          <div className="flex-down">
            <span className="tool-description">Defaults to </span>
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
          <div className="flex">
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
        </div>
      )}
    </div>
  );
}
