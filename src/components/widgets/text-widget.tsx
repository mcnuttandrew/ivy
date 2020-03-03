import React from 'react';
import {TextWidget, Widget} from '../../types';
import {GeneralWidget, WidgetBuilder} from './general-widget';

export function TextWidgetConfiguration(props: GeneralWidget<TextWidget>): JSX.Element {
  const {widget, idx, setWidgetValue} = props;
  return (
    <div className="text-widget">
      <textarea
        aria-label={`Message`}
        placeholder="Type a message that will appear in the encoding area"
        value={widget.config.text}
        onChange={(event): any => setWidgetValue('text', event.target.value, idx)}
      />
    </div>
  );
}

export function TextWidgetComponent(props: GeneralWidget<TextWidget>): JSX.Element {
  const {widget} = props;
  return <div className="text-widget">{widget.config.text}</div>;
}

const TextBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as Widget<TextWidget>;
  return {
    controls: <TextWidgetConfiguration {...common} widget={widg} />,
    uiElement: <TextWidgetComponent {...common} widget={widg} />,
    materializationOptions: (): {name: string; group?: string}[] => [],
  };
};

export default TextBuilder;
