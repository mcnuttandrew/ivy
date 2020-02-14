import React from 'react';
import {TiDelete, TiCog} from 'react-icons/ti';
import Selector from '../selector';
import Tooltip from 'rc-tooltip';
import {widgetInUse} from '../../utils';
import {TemplateWidget, WidgetSubType} from '../../templates/types';
import {AddLabelToWidget} from './widget-common';

interface PlacementControls {
  allowedWidgets: Set<string>;
  code: string;
  controls: JSX.Element;
  editMode: boolean;
  removeWidget: any;
  widget: TemplateWidget<WidgetSubType>;
}
const dontShowUsedIf = new Set(['Section', 'Text']);
interface ValidationBuilderProps {
  widget: TemplateWidget<WidgetSubType>;
}

function ValidationBuilder(props: ValidationBuilderProps): JSX.Element {
  const {widget} = props;
  return (
    <React.Fragment>
      <h3>Validations</h3>
      <h5>(Logic for showing/hiding this widget)</h5>
      {(widget.validations || []).map((validation, idx) => {
        return (
          <div className="flex" key={`validation-${idx}`}>
            <AddLabelToWidget label="Query Result">
              <Selector
                options={['show', 'hide'].map(key => ({display: key, value: key}))}
                selectedValue={validation.queryResult}
                onChange={(value: any): any => {
                  console.log('woah');
                }}
              />
            </AddLabelToWidget>
            <AddLabelToWidget label="Query">
              <div>{validation.query}</div>
            </AddLabelToWidget>
          </div>
        );
      })}
      <button
        onClick={(): void => {
          console.log('igh');
        }}
      >
        Add a validation
      </button>
    </React.Fragment>
  );
}

export default function WidgetConfigurationControls(props: PlacementControls): JSX.Element {
  const {allowedWidgets, code, controls, editMode, removeWidget, widget} = props;
  if (!editMode) {
    return <div />;
  }
  return (
    <div className="widget-handle flex">
      <Tooltip
        placement="right"
        trigger="click"
        overlay={
          <div className="flex-down">
            <h3>{widget.type}</h3>
            {!dontShowUsedIf.has(widget.type) && (
              <h5>{`Widget is currently ${widgetInUse(code, widget.name) ? 'in use' : 'not used'}`}</h5>
            )}
            {controls}
            <ValidationBuilder widget={widget} />
            <h3>Other Actions</h3>
            <button onClick={removeWidget}>
              Delete Widget <TiDelete />
            </button>
          </div>
        }
      >
        <div className="flex-down">
          <div className="code-edit-controls-button cursor-pointer">
            <TiCog />
          </div>
          <div className="in-use-status">{allowedWidgets.has(widget.name) ? 'Shown' : 'Hidden'}</div>
        </div>
      </Tooltip>
    </div>
  );
}
