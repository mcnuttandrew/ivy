import React from 'react';
import Tooltip from 'rc-tooltip';
import {GenWidget} from '../../types';
import {TiDeleteOutline} from 'react-icons/ti';
import {IgnoreKeys} from 'react-hotkeys';
import {classnames} from '../../utils';
import OnBlurInput from '../controlled-input';

interface EditParameterNameProps {
  widget: GenWidget;
  setWidgetValue: any;
  idx: number;
}
export function EditParameterName(props: EditParameterNameProps): JSX.Element {
  const {widget, setWidgetValue, idx} = props;
  return (
    <AddLabelToWidget label={'Parameter Name'}>
      <IgnoreKeys style={{height: '100%'}}>
        <OnBlurInput
          initialValue={widget.name || ''}
          label={`Parameter name`}
          update={(value): any => setWidgetValue('name', value, idx)}
        />
      </IgnoreKeys>
    </AddLabelToWidget>
  );
}

interface EditDisplayNameProps {
  widget: GenWidget;
  setWidgetValue: any;
  idx: number;
}
export function EditDisplayName(props: EditDisplayNameProps): JSX.Element {
  const {widget, setWidgetValue, idx} = props;
  return (
    <AddLabelToWidget label={'Display Name'}>
      <IgnoreKeys style={{height: '100%'}}>
        <OnBlurInput
          initialValue={widget.name || ''}
          label={`Display name`}
          update={(value): any => setWidgetValue('displayName', value, idx)}
        />
      </IgnoreKeys>
    </AddLabelToWidget>
  );
}

interface AddLabelToWidgetProps {
  children: JSX.Element;
  label: string;
}
export function AddLabelToWidget(props: AddLabelToWidgetProps): JSX.Element {
  const {children, label} = props;
  return (
    <div className="flex-down">
      <div className="tool-description">{label}</div>
      {children}
    </div>
  );
}
interface ResetProps {
  onClick: any;
  tooltipLabel: string;
  className?: string;
  direction?: string;
  buttonClassName?: string;
}
export function Reset(props: ResetProps): JSX.Element {
  const {onClick, tooltipLabel, className, direction = 'right', buttonClassName} = props;
  return (
    <Tooltip
      placement={direction}
      trigger="hover"
      mouseEnterDelay={0.5}
      overlay={
        <span
          className={classnames({
            'tooltip-internal': true,
            [className || '']: true,
          })}
        >
          {tooltipLabel}
        </span>
      }
    >
      <div
        className={classnames({
          'delete-option-button': true,
          'cursor-pointer': true,
          [buttonClassName]: true,
        })}
        onClick={onClick}
      >
        <TiDeleteOutline />
      </div>
    </Tooltip>
  );
}

export function widgetName(widget: GenWidget, editMode: boolean): string {
  if (editMode) {
    return widget.displayName ? `${widget.displayName} (${widget.name})` : widget.name;
  }
  return widget.displayName || widget.name;
}
