import React from 'react';
import {TextWidget, TemplateWidget} from '../../constants/templates';
interface TextBuilderWidgetProps {
  generalWidget: TemplateWidget;
  idx: number;
  setWidgetValue: any;
}

export default function TextBuilderWidget(props: TextBuilderWidgetProps) {
  const {generalWidget, idx, setWidgetValue} = props;
  // @ts-ignore
  const widget: TextWidget = generalWidget;
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
