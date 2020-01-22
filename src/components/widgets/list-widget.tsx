import React from 'react';
import {ListWidget, TemplateWidget} from '../../templates/types';
import Selector from '../selector';
import {MdSettings} from 'react-icons/md';
import {TiDeleteOutline} from 'react-icons/ti';
import Popover from '../popover';

import {GeneralWidget} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget} from './widget-common';

function OptionController(props: GeneralWidget<TemplateWidget<ListWidget>>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  return (
    <Popover
      className="list-options-popover"
      clickTarget={
        <span className="tool-description">
          <MdSettings /> Options{' '}
        </span>
      }
      style={{
        width: '130px',
        left: '-240px',
      }}
      body={(): JSX.Element => {
        return (
          <div>
            <h3>List Options</h3>
            {widget.widget.allowedValues.map((value, jdx) => {
              return (
                <div key={jdx} className="flex">
                  <div
                    className="delete-option-button"
                    onClick={(): void => {
                      const updated = [...widget.widget.allowedValues].filter((_, jdx) => jdx !== idx);
                      setWidgetValue('allowedValues', updated, idx);
                    }}
                  >
                    <TiDeleteOutline />
                  </div>
                  <div className="flex-down">
                    <input
                      value={value.value}
                      type="text"
                      onChange={(event): any => {
                        const newVal = event.target.value;
                        const updatedWidgets = widget.widget.allowedValues.map((d, indx) =>
                          indx === jdx ? {display: newVal, value: newVal} : {...d},
                        );
                        setWidgetValue('allowedValues', updatedWidgets, idx);
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <button
              onClick={(): void => {
                const updated = [...widget.widget.allowedValues, {display: 'X', value: 'X'}];
                setWidgetValue('allowedValues', updated, idx);
              }}
            >
              Add option
            </button>
          </div>
        );
      }}
    />
  );
}

export default function ListWidgetComponent(props: GeneralWidget<TemplateWidget<ListWidget>>): JSX.Element {
  const {widget, idx, setWidgetValue, editMode, templateMap, setTemplateValue} = props;
  const config = widget.widget;
  return (
    <div className="list-widget">
      {!editMode && (
        <div className="flex">
          <div className="widget-title">{widget.displayName || widget.widgetName}</div>
          <Selector
            options={widget.widget.allowedValues}
            selectedValue={templateMap[widget.widgetName]}
            onChange={(value: any): any => setTemplateValue({field: widget.widgetName, text: value})}
          />
          <div
            className="clear-option cursor-pointer"
            onClick={(): any => setTemplateValue({field: widget.widgetName, text: config.defaultValue})}
          >
            <TiDeleteOutline />
          </div>
        </div>
      )}
      {editMode && (
        <div className="flex">
          <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
          <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        </div>
      )}
      {editMode && (
        <div className="flex space-between">
          <AddLabelToWidget label={'Current Value'}>
            <Selector
              options={config.allowedValues}
              selectedValue={templateMap[widget.widgetName]}
              onChange={(value: any): any => {
                setTemplateValue({field: widget.widgetName, text: value});
              }}
            />
          </AddLabelToWidget>
          <AddLabelToWidget label={'Default value'}>
            <Selector
              options={config.allowedValues}
              selectedValue={config.defaultValue}
              onChange={(value: any): any => setWidgetValue('defaultValue', value, idx)}
            />
          </AddLabelToWidget>
          <OptionController {...props} />
        </div>
      )}
    </div>
  );
}
