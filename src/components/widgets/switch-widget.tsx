import React from 'react';
import Switch from 'react-switch';
import {SwitchWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';

export default function SwitchWidgetComponent(
  props: GeneralWidget<TemplateWidget<SwitchWidget>>,
): JSX.Element {
  const {widget, idx, setWidgetValue, editMode, templateMap, setTemplateValue} = props;
  const isActive = templateMap[widget.widgetName] === widget.widget.activeValue;

  return (
    <div className="flex-down switch-widget">
      <div className="flex-down">
        <div className="flex space-between">
          {editMode && (
            <div className="flex-down">
              <div className="tool-description">Parameter Name</div>
              <input
                value={widget.widgetName}
                type="text"
                onChange={(event): any => setWidgetValue('widgetName', event.target.value, idx)}
              />
            </div>
          )}
          {editMode && (
            <div className="flex-down">
              <div className="tool-description">Display Name</div>
              <input
                value={widget.displayName}
                type="text"
                onChange={(event): any => setWidgetValue('displayName', event.target.value, idx)}
              />
            </div>
          )}
          {!editMode && <div>{widget.displayName || widget.widgetName}</div>}
          <div className="flex-down">
            {editMode && <div className="tool-description">Current Value</div>}
            <Switch
              checked={isActive}
              offColor="#E1E9F2"
              onColor="#36425C"
              height={15}
              checkedIcon={false}
              width={50}
              onChange={(): void => {
                setTemplateValue({
                  field: widget.widgetName,
                  text: isActive ? widget.widget.inactiveValue : widget.widget.activeValue,
                });
              }}
            />
          </div>
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
              onChange={(): void => {
                setWidgetValue('defaultsToActive', !widget.widget.defaultsToActive, idx);
              }}
            />
          </div>
          <div className="flex">
            <div className="flex-down">
              <span className="tool-description">Active Value</span>
              <input
                value={widget.widget.activeValue}
                type="text"
                onChange={(event): void => {
                  setWidgetValue('activeValue', event.target.value, idx);
                }}
              />
            </div>
            <div className="flex-down">
              <span className="tool-description">Inactive Value</span>
              <input
                value={widget.widget.inactiveValue}
                type="text"
                onChange={(event): void => {
                  setWidgetValue('inactiveValue', event.target.value, idx);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
