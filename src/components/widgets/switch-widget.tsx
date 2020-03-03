import React from 'react';
import Switch from 'react-switch';
import {IgnoreKeys} from 'react-hotkeys';
import {SwitchWidget, Widget} from '../../types';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget, widgetName} from './widget-common';
import {switchCommon} from '../../constants';

function SwitchWidgetConfiguration(props: GeneralWidget<SwitchWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  const config = widget.config;
  return (
    <div className="flex-down switch-widget">
      <div className="flex-down">
        <div className="flex space-between">
          <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
          <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        </div>
      </div>
      <div className="flex">
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
              aria-label={`Inactive value`}
              value={config.activeValue}
              type="text"
              onChange={(event): void => setWidgetValue('activeValue', event.target.value, idx)}
            />
          </IgnoreKeys>
        </AddLabelToWidget>
        <AddLabelToWidget label={'Inactive Value'}>
          <IgnoreKeys style={{height: '100%'}}>
            <input
              aria-label={`Inactive value`}
              value={config.inactiveValue}
              type="text"
              onChange={(event): void => setWidgetValue('inactiveValue', event.target.value, idx)}
            />
          </IgnoreKeys>
        </AddLabelToWidget>
      </div>
    </div>
  );
}

function SwitchWidgetComponent(props: GeneralWidget<SwitchWidget>): JSX.Element {
  const {widget, templateMap, setTemplateValue, editMode} = props;
  const config = widget.config;
  const isActive = templateMap[widget.name] === config.activeValue;

  return (
    <div className="flex-down switch-widget">
      <div className="flex-down">
        <div className="flex space-between">
          <div className="widget-title">{widgetName(widget, editMode)}</div>
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
        </div>
      </div>
    </div>
  );
}

const SwitchBuilder: WidgetBuilder = (widget, common) => {
  return {
    controls: <SwitchWidgetConfiguration {...common} widget={widget as Widget<SwitchWidget>} />,
    uiElement: <SwitchWidgetComponent {...common} widget={widget as Widget<SwitchWidget>} />,
    materializationOptions: (): {name: string; group?: string}[] => [
      {name: (widget as Widget<SwitchWidget>).config.activeValue},
      {name: (widget as Widget<SwitchWidget>).config.inactiveValue},
    ],
  };
};

export default SwitchBuilder;
