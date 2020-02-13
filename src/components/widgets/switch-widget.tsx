import React from 'react';
import Switch from 'react-switch';
import {IgnoreKeys} from 'react-hotkeys';
import {SwitchWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget} from './widget-common';

export default function SwitchWidgetComponent(
  props: GeneralWidget<TemplateWidget<SwitchWidget>>,
): JSX.Element {
  const {widget, idx, setWidgetValue, editMode, templateMap, setTemplateValue} = props;
  const config = widget.config;
  const isActive = templateMap[widget.name] === config.activeValue;
  const switchCommon = {
    offColor: '#E1E9F2',
    onColor: '#36425C',
    height: 15,
    checkedIcon: false,
    width: 50,
  };

  const currentSwitch = (
    <Switch
      {...switchCommon}
      checked={isActive}
      onChange={(): void => {
        setTemplateValue({
          field: widget.name,
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
          {!editMode && <div className="widget-title">{widget.displayName || widget.name}</div>}
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
            <IgnoreKeys style={{height: '100%'}}>
              <input
                value={config.activeValue}
                type="text"
                onChange={(event): void => setWidgetValue('activeValue', event.target.value, idx)}
              />
            </IgnoreKeys>
          </AddLabelToWidget>
          <AddLabelToWidget label={'Inactive Value'}>
            <IgnoreKeys style={{height: '100%'}}>
              <input
                value={config.inactiveValue}
                type="text"
                onChange={(event): void => setWidgetValue('inactiveValue', event.target.value, idx)}
              />
            </IgnoreKeys>
          </AddLabelToWidget>
        </div>
      )}
    </div>
  );
}
