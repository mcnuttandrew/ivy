import React from 'react';
import {TiDelete, TiCog, TiExportOutline} from 'react-icons/ti';
import Selector from '../selector';
import Tooltip from 'rc-tooltip';
import {TemplateMap, GenWidget, Condition} from '../../types';
import {ColumnHeader} from '../../types';
import {IgnoreKeys} from 'react-hotkeys';
import {GenericAction, SetTemplateValuePayload, SetWidgetValuePayload} from '../../actions';
import {AddLabelToWidget, Reset} from './widget-common';
import OnBlurInput from '../controlled-input';

interface PlacementControlsProps {
  columns: ColumnHeader[];
  editMode: boolean;
  controls: JSX.Element;
  idx: number;
  moveWidget: (...args: any[]) => void;
  removeWidget: GenericAction<number>;
  duplicateWidget: GenericAction<number>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  widget: GenWidget;
  widgetIsAllowed: boolean;
}
interface ConditionBuilderProps {
  idx: number;
  setWidgetValue: any;
  widget: GenWidget;
}

type TalidationUpdateLens = (d: Condition, val: any) => Condition;
type TalidationUpdate = (jdx: number, updater: TalidationUpdateLens) => (value: any) => void;
const fromStr: TalidationUpdateLens = (d, value): any => ({...d, queryResult: value}) as Condition;
const fromControledInput: TalidationUpdateLens = (d, query): any => ({...d, query});

function ConditionBuilder(props: ConditionBuilderProps): JSX.Element {
  const {widget, setWidgetValue, idx} = props;
  const conditions = widget.conditions || [];

  const conditionUpdate: TalidationUpdate =
    (jdx, updater) =>
    (val): any => {
      const mapper = (d: Condition, kdx: number): any => (jdx !== kdx ? {...d} : updater(d, val));
      setWidgetValue({key: 'conditions', value: conditions.map(mapper), idx});
    };

  return (
    <React.Fragment>
      <h3>Conditions</h3>
      <h5>(Logic for showing/hiding this widget)</h5>
      {conditions.map((condition, jdx) => {
        return (
          <div className="flex space-between" key={`condition-${jdx}`}>
            <AddLabelToWidget label="Query Result">
              <Selector
                options={['show', 'hide'].map((key) => ({display: key, value: key}))}
                selectedValue={condition.queryResult}
                onChange={conditionUpdate(jdx, fromStr)}
              />
            </AddLabelToWidget>
            <AddLabelToWidget label="Query">
              {/* @ts-ignore */}
              <IgnoreKeys style={{height: '100%'}}>
                <OnBlurInput
                  initialValue={condition.query}
                  label={`condition query`}
                  update={conditionUpdate(jdx, fromControledInput)}
                />
              </IgnoreKeys>
            </AddLabelToWidget>
            <Reset
              tooltipLabel="remove this condition"
              onClick={(): void => {
                setWidgetValue({key: 'conditions', value: conditions.filter((_, kdx) => jdx !== kdx), idx});
              }}
            />
          </div>
        );
      })}
      <button
        type="button"
        onClick={(): void => {
          setWidgetValue({
            key: 'conditions',
            value: conditions.concat({query: 'true', queryResult: 'show'}),
            idx,
          });
        }}
      >
        Add a condition
      </button>
    </React.Fragment>
  );
}

export default function WidgetConfigurationControls(props: PlacementControlsProps): JSX.Element {
  const {widgetIsAllowed, controls, duplicateWidget, editMode, idx, removeWidget, setWidgetValue, widget} =
    props;
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
            {controls}
            <ConditionBuilder widget={widget} setWidgetValue={setWidgetValue} idx={idx} />
            <h3>Other Actions</h3>
            <div className="flex">
              <button onClick={(): any => duplicateWidget(idx)}>
                Duplicate Widget <TiExportOutline />
              </button>
              <button onClick={(): any => removeWidget(idx)}>
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
            <div className="in-use-status">{widgetIsAllowed ? 'Shown' : 'Hidden'}</div>
          </div>
          <span className="grippy" />
        </div>
      </Tooltip>
    </div>
  );
}
