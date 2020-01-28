import React from 'react';
import {TemplateWidget, WidgetSubType} from '../../templates/types';

interface EditParameterNameProps {
  widget: TemplateWidget<WidgetSubType>;
  setWidgetValue: any;
  idx: number;
}
export function EditParameterName(props: EditParameterNameProps): JSX.Element {
  const {widget, setWidgetValue, idx} = props;
  return (
    <AddLabelToWidget label={'Parameter Name'}>
      <input
        value={widget.widgetName || ''}
        type="text"
        onChange={(event): any => setWidgetValue('widgetName', event.target.value, idx)}
      />
    </AddLabelToWidget>
  );
}

interface EditDisplayNameProps {
  widget: TemplateWidget<WidgetSubType>;
  setWidgetValue: any;
  idx: number;
}
export function EditDisplayName(props: EditDisplayNameProps): JSX.Element {
  const {widget, setWidgetValue, idx} = props;
  return (
    <AddLabelToWidget label={'Display Name'}>
      <input
        value={widget.displayName || ''}
        type="text"
        onChange={(event): any => setWidgetValue('displayName', event.target.value, idx)}
      />
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
