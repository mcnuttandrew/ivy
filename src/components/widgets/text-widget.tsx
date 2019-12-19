import React from 'react';
import {TextWidget, TemplateWidget} from '../../templates/types';
import {GeneralWidget} from './general-widget';

export default function TextWidget(
  props: GeneralWidget<TemplateWidget<TextWidget>>,
) {
  const {widget, idx, setWidgetValue, editMode} = props;
  if (!editMode) {
    return <div className="text-widget">{widget.widget.text}</div>;
  }
  return (
    <div className="text-widget">
      <textarea
        placeholder="Type a message that will appear in the encoding area"
        value={widget.widget.text}
        onChange={event => setWidgetValue('text', event.target.value, idx)}
      />
    </div>
  );
}
