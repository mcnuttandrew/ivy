import React from 'react';
import Switch from 'react-switch';
import {SwitchWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';

export default function SwitchWidget(
  props: GeneralWidget<TemplateWidget<SwitchWidget>>,
) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    setTemplateValue,
  } = props;
  const isActive = templateMap[widget.widgetName] === widget.widget.activeValue;

  return (
    <div className="flex-down switch-widget">
      <div className="flex-down">
        <div className="flex space-between">
          {editMode && (
            <input
              value={widget.widgetName}
              type="text"
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
                text: isActive
                  ? widget.widget.inactiveValue
                  : widget.widget.activeValue,
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
              checked={!!widget.widget.defaultsToActive}
              offColor="#E1E9F2"
              onColor="#36425C"
              height={15}
              checkedIcon={false}
              width={50}
              onChange={() =>
                setWidgetValue(
                  'defaultsToActive',
                  !widget.widget.defaultsToActive,
                  idx,
                )
              }
            />
          </div>
          <div className="flex">
            <div className="flex-down">
              <span className="tool-description">Active Value</span>
              <input
                value={widget.widget.activeValue}
                type="text"
                onChange={event =>
                  setWidgetValue('activeValue', event.target.value, idx)
                }
              />
            </div>
            <div className="flex-down">
              <span className="tool-description">Inactive Value</span>
              <input
                value={widget.widget.inactiveValue}
                type="text"
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
