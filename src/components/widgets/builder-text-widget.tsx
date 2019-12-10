import React from 'react';
import {TextWidget} from '../../templates/types';
interface TextBuilderWidgetProps {
  widget: TextWidget;
  idx: number;
  setWidgetValue: any;
}

export default function TextBuilderWidget(props: TextBuilderWidgetProps) {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div key={widget.widgetName}>
      <textarea
        placeholder="Type a message that will appear in the encoding area"
        value={widget.text}
        onChange={event => setWidgetValue('text', event.target.value, idx)}
      />
    </div>
  );
}
