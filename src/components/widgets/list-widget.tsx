import React from 'react';
import {ListWidget} from '../../templates/types';
import {MdSettings} from 'react-icons/md';
import Selector from '../selector';
import {TiDeleteOutline} from 'react-icons/ti';
import Popover from '../popover';

import {GeneralWidget} from './general-widget';

function DefaultValue(props: GeneralWidget<ListWidget>) {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div className="flex">
      <span className="tool-description full-width"> Default value </span>
      <Selector
        options={widget.allowedValues}
        selectedValue={widget.defaultValue}
        onChange={(value: any) => setWidgetValue('defaultValue', value, idx)}
      />
    </div>
  );
}

function OptionController(props: GeneralWidget<ListWidget>) {
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
            {widget.allowedValues.map((value, jdx) => {
              return (
                <div key={jdx} className="flex">
                  <div
                    className="delete-option-button"
                    onClick={() => {
                      const updated = [...widget.allowedValues].filter(
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
                      onChange={event => {
                        const newVal = event.target.value;
                        setWidgetValue(
                          'allowedValues',
                          widget.allowedValues.map((d, indx) =>
                            indx === idx
                              ? {display: newVal, value: newVal}
                              : {...d},
                          ),
                          idx,
                        );
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => {
                const updated = [
                  ...widget.allowedValues,
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

export default function ListWidget(props: GeneralWidget<ListWidget>) {
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
            onChange={event =>
              setWidgetValue('widgetName', event.target.value, idx)
            }
          />
        )}
        {!editMode && <div>{widget.widgetName}</div>}
        <Selector
          options={widget.allowedValues}
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
