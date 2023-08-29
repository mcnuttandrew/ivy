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
          {/* @ts-ignore */}
          <Switch
            {...switchCommon}
            checked={!!config.defaultsToActive}
            onChange={(): any =>
              setWidgetValue({key: 'defaultsToActive', value: !config.defaultsToActive, idx})
            }
          />
        </AddLabelToWidget>
        <AddLabelToWidget label={'Active Value'}>
          {/* @ts-ignore */}
          <IgnoreKeys style={{height: '100%'}}>
            <input
              aria-label={`Inactive value`}
              value={config.active}
              type="text"
              onChange={(event): any => setWidgetValue({key: 'active', value: event.target.value, idx})}
            />
          </IgnoreKeys>
        </AddLabelToWidget>
        <AddLabelToWidget label={'Inactive Value'}>
          {/* @ts-ignore */}
          <IgnoreKeys style={{height: '100%'}}>
            <input
              aria-label={`Inactive value`}
              value={config.inactive}
              type="text"
              onChange={(event): any => setWidgetValue({key: 'inactive', value: event.target.value, idx})}
            />
          </IgnoreKeys>
        </AddLabelToWidget>
      </div>
    </div>
  );
}

function SwitchWidgetComponent(props: GeneralWidget<SwitchWidget>): JSX.Element {
  const {widget, widgetValue, setTemplateValue, editMode} = props;
  const config = widget.config;
  const isActive = widgetValue === config.active;

  return (
    <div className="flex-down switch-widget">
      <div className="flex-down">
        <div className="flex space-between">
          <div className="widget-title">{widgetName(widget, editMode)}</div>
          {/* @ts-ignore */}
          <Switch
            {...switchCommon}
            checked={isActive}
            onChange={(): void => {
              setTemplateValue({
                field: widget.name,
                text: isActive ? config.inactive : config.active,
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
      {name: (widget as Widget<SwitchWidget>).config.active},
      {name: (widget as Widget<SwitchWidget>).config.inactive},
    ],
  };
};

export default SwitchBuilder;
