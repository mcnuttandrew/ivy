import React from 'react';
import {ListWidget, Widget} from '../../types';
import Selector from '../selector';
import {IgnoreKeys} from 'react-hotkeys';

import {GeneralWidget, WidgetBuilder} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget, Reset, widgetName} from './widget-common';

export function ListWidgetConfiguration(props: GeneralWidget<ListWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  const config = widget.config;
  return (
    <div className="flex-down">
      <div className="flex">
        <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        <AddLabelToWidget label={'Default value'}>
          <Selector
            options={config.allowedValues}
            selectedValue={config.defaultValue || ''}
            onChange={(value: any): any => setWidgetValue('defaultValue', value, idx)}
          />
        </AddLabelToWidget>
      </div>
      <h3>List Options</h3>
      {widget.config.allowedValues.map((value, jdx) => {
        return (
          <div key={jdx} className="flex">
            <Reset
              tooltipLabel={'Remove this option from the list'}
              direction="left"
              onClick={(): void => {
                const updated = [...widget.config.allowedValues].filter((_, jdx) => jdx !== idx);
                setWidgetValue('allowedValues', updated, idx);
              }}
            />
            <div className="flex-down">
              <IgnoreKeys style={{height: '100%'}}>
                <input
                  aria-label={`allow value set`}
                  value={value.value}
                  type="text"
                  onChange={(event): any => {
                    const newVal = event.target.value;
                    const updatedWidgets = widget.config.allowedValues.map((d, indx) =>
                      indx === jdx ? {display: newVal, value: newVal} : {...d},
                    );
                    setWidgetValue('allowedValues', updatedWidgets, idx);
                  }}
                />
              </IgnoreKeys>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={(): void => {
          const updated = [...widget.config.allowedValues, {display: 'X', value: 'X'}];
          setWidgetValue('allowedValues', updated, idx);
        }}
      >
        Add option
      </button>
    </div>
  );
}

function ListWidgetComponent(props: GeneralWidget<ListWidget>): JSX.Element {
  const {widget, templateMap, setTemplateValue, editMode} = props;
  const config = widget.config;
  return (
    <div className="list-widget">
      <div className="flex">
        <div className="widget-title">{widgetName(widget, editMode)}</div>
        <Selector
          options={widget.config.allowedValues}
          selectedValue={templateMap[widget.name] || ''}
          onChange={(value: any): any => setTemplateValue({field: widget.name, text: value})}
        />
        <Reset
          tooltipLabel={`Reset to list to the default value: ${widget.config.defaultValue}`}
          className="clear-option cursor-pointer"
          onClick={(): any => setTemplateValue({field: widget.name, text: config.defaultValue})}
        />
      </div>
    </div>
  );
}

const ListBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as Widget<ListWidget>;
  return {
    controls: <ListWidgetConfiguration {...common} widget={widg} />,
    uiElement: <ListWidgetComponent {...common} widget={widg} />,
    materializationOptions: (): {name: string; group?: string}[] =>
      (widget as Widget<ListWidget>).config.allowedValues.map(d => ({name: `"${d.display}"`})),
  };
};

export default ListBuilder;
