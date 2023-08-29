/* eslint-disable react/display-name */
import React from 'react';
import {ListWidget, Widget} from '../../types';
import Selector from '../selector';
import {IgnoreKeys} from 'react-hotkeys';
import {TiArrowDown, TiArrowUp} from 'react-icons/ti';
import {GenericAction, SetWidgetValuePayload} from '../../actions';
import {trim} from '../../utils/index';

import {GeneralWidget, WidgetBuilder} from './general-widget';
import {EditParameterName, EditDisplayName, AddLabelToWidget, Reset, widgetName} from './widget-common';

type DisplayRow = {display: string; value: string};
function toDisplayVal(vals: (DisplayRow | string)[]): DisplayRow[] {
  return vals.map((row: string | {display: string; value: string}) => {
    if (typeof row === 'string') {
      return {display: row, value: row};
    }
    return row;
  });
}
function updateValue(arr: any[], newVal: any, idx: number): any[] {
  const updatedArr = [...arr];
  updatedArr[idx] = newVal;
  return updatedArr;
}
function optionRow(
  configVals: (DisplayRow | string)[],
  setWidgetValue: GenericAction<SetWidgetValuePayload>,
  idx: number,
): (val: DisplayRow, jdx: number) => JSX.Element {
  const usingDisplayValueFormat = !(typeof configVals[0] === 'string');
  const update = (currentIndex: number, newIndex: number) => (): void => {
    const newVals = [...configVals];
    const oldVal = configVals[newIndex];
    newVals[newIndex] = configVals[currentIndex];
    newVals[currentIndex] = oldVal;
    setWidgetValue({key: 'allowedValues', value: newVals, idx});
  };
  return (value: DisplayRow, jdx: number): JSX.Element => {
    return (
      <div key={jdx} className="flex">
        <div
          className="cursor-pointer list-widget-row-button"
          onClick={update(jdx, Math.min(jdx + 1, configVals.length - 1))}
        >
          <TiArrowDown />
        </div>
        <div className="cursor-pointer list-widget-row-button" onClick={update(jdx, Math.max(jdx - 1, 0))}>
          <TiArrowUp />
        </div>
        <div className="flex">
          <AddLabelToWidget label="Option Value">
            <IgnoreKeys style={{height: '100%'}}>
              <input
                aria-label={`allow value set`}
                value={value.value}
                type="text"
                onChange={(event: {target: {value: any}}): any => {
                  const newVal = event.target.value;
                  const newRow = usingDisplayValueFormat ? {display: newVal, value: newVal} : `${newVal}`;
                  setWidgetValue({key: 'allowedValues', value: updateValue(configVals, newRow, jdx), idx});
                }}
              />
            </IgnoreKeys>
          </AddLabelToWidget>
          {usingDisplayValueFormat && (
            <AddLabelToWidget label="Option Display Name">
              <IgnoreKeys style={{height: '100%'}}>
                <input
                  aria-label={`allow value set`}
                  value={value.display}
                  type="text"
                  onChange={(event): any => {
                    const newRow = {...value, display: event.target.value};
                    setWidgetValue({key: 'allowedValues', value: updateValue(configVals, newRow, jdx), idx});
                  }}
                />
              </IgnoreKeys>
            </AddLabelToWidget>
          )}
        </div>
        <Reset
          tooltipLabel={'Remove this option from the list'}
          direction="left"
          buttonClassName="list-widget-row-button"
          onClick={(): void => {
            const updated = [...configVals].filter((_, kdx) => kdx !== jdx);
            setWidgetValue({key: 'allowedValues', value: updated, idx});
          }}
        />
      </div>
    );
  };
}

export function ListWidgetConfiguration(props: GeneralWidget<ListWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  const config = widget.config;
  const vals = toDisplayVal(config.allowedValues);
  const usingDisplayValueFormat = !(typeof config.allowedValues[0] === 'string');
  const updateList = (value: any): any => {
    setWidgetValue({key: 'allowedValues', value, idx});
  };

  return (
    <div className="flex-down">
      <div className="flex">
        <EditParameterName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        <EditDisplayName widget={widget} idx={idx} setWidgetValue={setWidgetValue} />
        <AddLabelToWidget label={'Default value'}>
          <Selector
            options={vals}
            selectedValue={config.defaultValue || ''}
            onChange={(value: any): any => setWidgetValue({key: 'defaultValue', value, idx})}
          />
        </AddLabelToWidget>
      </div>
      <h3>List Options</h3>
      {vals.map(optionRow(config.allowedValues, setWidgetValue, idx))}
      <div className="flex">
        <button type="button" onClick={(): any => updateList([...vals, {display: 'X', value: 'X'}])}>
          Add option
        </button>

        {!usingDisplayValueFormat && (
          <button type="button" onClick={(): any => updateList(vals)}>
            Expose Display Name
          </button>
        )}
        {usingDisplayValueFormat && (
          <button type="button" onClick={(): any => updateList(vals.map((d) => d.value))}>
            Just Use Values
          </button>
        )}
      </div>
    </div>
  );
}

function ListWidgetComponent(props: GeneralWidget<ListWidget>): JSX.Element {
  const {widget, widgetValue, setTemplateValue, editMode} = props;
  const config = widget.config;
  const firstVal = config.allowedValues[0];
  const vals = toDisplayVal(config.allowedValues);
  return (
    <div className="list-widget">
      <div className="flex">
        <div className="widget-title">{widgetName(widget, editMode)}</div>
        <Selector
          options={vals}
          selectedValue={widgetValue || ''}
          onChange={(value: any): any => setTemplateValue({field: widget.name, text: value})}
        />
        <Reset
          tooltipLabel={`Reset to list to the default value: ${widget.config.defaultValue}`}
          className="clear-option cursor-pointer"
          onClick={(): any =>
            setTemplateValue({
              field: widget.name,
              text: config.defaultValue || (typeof firstVal === 'string' ? firstVal : firstVal.value),
            })
          }
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
    materializationOptions: (): {name: string; group?: string}[] => {
      const vals = toDisplayVal((widget as Widget<ListWidget>).config.allowedValues);
      return vals.map((d) => ({name: `"${trim(d.display)}"`}));
    },
  };
};

export default ListBuilder;
