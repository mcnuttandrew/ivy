import React from 'react';
import Switch from 'react-switch';
import {IgnoreKeys} from 'react-hotkeys';
import {SwitchWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget, WidgetBuilder} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget} from './widget-common';

const switchCommon = {
  offColor: '#E1E9F2',
  onColor: '#36425C',
  height: 15,
  checkedIcon: false,
  width: 50,
};

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
    </div>
  );
}

function SwitchWidgetComponent(props: GeneralWidget<SwitchWidget>): JSX.Element {
  const {widget, templateMap, setTemplateValue} = props;
  const config = widget.config;
  const isActive = templateMap[widget.name] === config.activeValue;

  return (
    <div className="flex-down switch-widget">
      <div className="flex-down">
        <div className="flex space-between">
          <div className="widget-title">{widget.displayName || widget.name}</div>
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
  const widg = widget as TemplateWidget<SwitchWidget>;
  return {
    controls: <SwitchWidgetConfiguration {...common} widget={widg} />,
    uiElement: <SwitchWidgetComponent {...common} widget={widg} />,
  };
};

export default SwitchBuilder;
