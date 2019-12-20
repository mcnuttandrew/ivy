import React from 'react';
import {ListWidget, TemplateWidget} from '../../templates/types';
import {MdSettings} from 'react-icons/md';
import Selector from '../selector';
import {TiDeleteOutline} from 'react-icons/ti';
import Popover from '../popover';

import {GeneralWidget} from './general-widget';

function DefaultValue(props: GeneralWidget<TemplateWidget<ListWidget>>) {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div className="flex">
      <span className="tool-description full-width"> Default value </span>
      <Selector
        options={widget.widget.allowedValues}
        selectedValue={widget.widget.defaultValue}
        onChange={(value: any) => setWidgetValue('defaultValue', value, idx)}
      />
    </div>
  );
}

function OptionController(props: GeneralWidget<TemplateWidget<ListWidget>>) {
  const {widget, idx, setWidgetValue} = props;
  return (
    <Popover
      className="list-options-popover"
      clickTarget={
        <span className="tool-description">
          <MdSettings /> Options{' '}
        </span>
      }
      body={() => {
        return (
          <div>
            <h3>List Options</h3>
            {widget.widget.allowedValues.map((value, jdx) => {
              return (
                <div key={jdx} className="flex">
                  <div
                    className="delete-option-button"
                    onClick={() => {
                      const updated = [...widget.widget.allowedValues].filter(
                        (_, jdx) => jdx !== idx,
                      );
                      setWidgetValue('allowedValues', updated, idx);
                    }}
                  >
                    <TiDeleteOutline />
                  </div>
                  <div className="flex-down">
                    <input
                      value={value.value}
                      type="text"
                      onChange={event => {
                        const newVal = event.target.value;
                        const updatedWidgets = widget.widget.allowedValues.map(
                          (d, indx) =>
                            indx === jdx
                              ? {display: newVal, value: newVal}
                              : {...d},
                        );
                        console.log(updatedWidgets);
                        setWidgetValue('allowedValues', updatedWidgets, idx);
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => {
                const updated = [
                  ...widget.widget.allowedValues,
                  {display: 'X', value: 'X'},
                ];
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

export default function ListWidget(
  props: GeneralWidget<TemplateWidget<ListWidget>>,
) {
  const {
    widget,
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    setTemplateValue,
  } = props;
  return (
    <div className="list-widget">
      <div className="flex">
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
        <Selector
          options={widget.widget.allowedValues}
          selectedValue={templateMap[widget.widgetName]}
          onChange={(value: any) => {
            setTemplateValue({field: widget.widgetName, text: value});
          }}
        />
      </div>
      {editMode && (
        <div className="flex-down">
          <OptionController {...props} />
          <DefaultValue {...props} />
        </div>
      )}
    </div>
  );
}
