import React from 'react';
import {TiDelete, TiCog, TiExportOutline} from 'react-icons/ti';
import Selector from '../selector';
import Tooltip from 'rc-tooltip';
import {TemplateMap, GenWidget, Condition} from '../../types';
import {ColumnHeader} from '../../types';
import {IgnoreKeys} from 'react-hotkeys';
import {GenericAction, SetTemplateValuePayload} from '../../actions';
import {AddLabelToWidget} from './widget-common';

interface PlacementControlsProps {
  allowedWidgets: Set<string>;
  code: string;
  columns: ColumnHeader[];
  editMode: boolean;
  controls: JSX.Element;
  idx: number;
  moveWidget: (...args: any[]) => void;
  removeWidget: any;
  duplicateWidget: any;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: any;
  templateMap: TemplateMap;
  widget: GenWidget;
}
const dontShowUsedIf = new Set(['Section', 'Text']);
interface ConditionBuilderProps {
  idx: number;
  setWidgetValue: any;
  widget: GenWidget;
}

type TalidationUpdateLens = (d: Condition, val: any) => Condition;
type TalidationUpdate = (jdx: number, updater: TalidationUpdateLens) => (value: any) => void;
const fromStr: TalidationUpdateLens = (d, value): any => ({...d, queryResult: value} as Condition);
const fromEvent: TalidationUpdateLens = (d, event): any => ({...d, query: event.target.value});

function ConditionBuilder(props: ConditionBuilderProps): JSX.Element {
  const {widget, setWidgetValue, idx} = props;
  const conditions = widget.conditions || [];

  const conditionUpdate: TalidationUpdate = (jdx, updater) => (val): any => {
    const mapper = (d: Condition, kdx: number): any => (jdx !== kdx ? {...d} : updater(d, val));
    setWidgetValue('conditions', conditions.map(mapper), idx);
  };

  return (
    <React.Fragment>
      <h3>Conditions</h3>
      <h5>(Logic for showing/hiding this widget)</h5>
      {conditions.map((condition, jdx) => {
        return (
          <div className="flex" key={`condition-${jdx}`}>
            <AddLabelToWidget label="Query Result">
              <Selector
                options={['show', 'hide'].map(key => ({display: key, value: key}))}
                selectedValue={condition.queryResult}
                onChange={conditionUpdate(jdx, fromStr)}
              />
            </AddLabelToWidget>
            <AddLabelToWidget label="Query">
              <IgnoreKeys style={{height: '100%'}}>
                <input
                  aria-label={`condition query`}
                  value={condition.query}
                  type="text"
                  onChange={conditionUpdate(jdx, fromEvent)}
                />
              </IgnoreKeys>
            </AddLabelToWidget>
          </div>
        );
      })}
      <button
        type="button"
        onClick={(): void => {
          setWidgetValue('conditions', conditions.concat({query: 'true', queryResult: 'show'}), idx);
        }}
      >
        Add a condition
      </button>
    </React.Fragment>
  );
}

function widgetInUse(code: string, name: string): boolean {
  return Boolean(code.match(new RegExp(`\\[${name}\\]`, 'g')));
}

export default function WidgetConfigurationControls(props: PlacementControlsProps): JSX.Element {
  const {
    allowedWidgets,
    code,
    controls,
    editMode,
    removeWidget,
    duplicateWidget,
    widget,
    setWidgetValue,
    idx,
  } = props;
  if (!editMode) {
    return <div />;
  }
  return (
    <div className="widget-handle flex">
      <Tooltip
        placement="right"
        trigger="click"
        overlay={
          <div className="flex-down widget-config-tooltip">
            <h3>{widget.type}</h3>
            {!dontShowUsedIf.has(widget.type) && (
              <h5>{`Widget is currently ${widgetInUse(code, widget.name) ? 'in use' : 'not used'}`}</h5>
            )}
            {controls}
            <ConditionBuilder widget={widget} setWidgetValue={setWidgetValue} idx={idx} />
            <h3>Other Actions</h3>
            <div className="flex">
              <button onClick={duplicateWidget}>
                Duplicate Widget <TiExportOutline />
              </button>
              <button onClick={removeWidget}>
                Delete Widget <TiDelete />
              </button>
            </div>
          </div>
        }
      >
        <div className="flex center">
          <div className="flex-down">
            <div className="code-edit-controls-button cursor-pointer">
              <TiCog />
            </div>
            <div className="in-use-status">{allowedWidgets.has(widget.name) ? 'Shown' : 'Hidden'}</div>
          </div>
          <span className="grippy" />
        </div>
      </Tooltip>
    </div>
  );
}
