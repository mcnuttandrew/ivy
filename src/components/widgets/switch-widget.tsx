import React from 'react';
import Switch from 'react-switch';
import {SwitchWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget} from './widget-common';

export default function SwitchWidgetComponent(
  props: GeneralWidget<TemplateWidget<SwitchWidget>>,
): JSX.Element {
  const {widget, idx, setWidgetValue, editMode, templateMap, setTemplateValue} = props;
  const isActive = templateMap[widget.widgetName] === widget.widget.activeValue;
  const switchCommon = {
    offColor: '#E1E9F2',
    onColor: '#36425C',
    height: 15,
    checkedIcon: false,
    width: 50,
  };
  const config = widget.widget;
  const currentSwitch = (
    <Switch
      {...switchCommon}
      checked={isActive}
      onChange={(): void => {
        setTemplateValue({
          field: widget.widgetName,
          text: isActive ? config.inactiveValue : config.activeValue,
        });
      }}
    />
  );
  return (
    <div className="flex-down switch-widget">
      <div className="flex-down">
        <div className="flex space-between">
          {editMode && <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />}
          {editMode && <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />}
          {!editMode && <div className="widget-title">{widget.displayName || widget.widgetName}</div>}
          {!editMode && currentSwitch}
        </div>
      </div>
      {editMode && (
        <div className="flex">
          <AddLabelToWidget label={'Current'}>{currentSwitch}</AddLabelToWidget>
          <AddLabelToWidget label={'Default'}>
            <Switch
              {...switchCommon}
              checked={!!config.defaultsToActive}
              onChange={(): any => setWidgetValue('defaultsToActive', !config.defaultsToActive, idx)}
            />
          </AddLabelToWidget>
          <AddLabelToWidget label={'Active Value'}>
            <input
              value={config.activeValue}
              type="text"
              onChange={(event): void => setWidgetValue('activeValue', event.target.value, idx)}
            />
          </AddLabelToWidget>
          <AddLabelToWidget label={'Inactive Value'}>
            <input
              value={config.inactiveValue}
              type="text"
              onChange={(event): void => setWidgetValue('inactiveValue', event.target.value, idx)}
            />
          </AddLabelToWidget>
        </div>
      )}
    </div>
  );
}
