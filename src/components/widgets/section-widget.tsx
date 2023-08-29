import React from 'react';
import {SectionWidget, Widget} from '../../types';
import {GeneralWidget, WidgetBuilder} from './general-widget';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SectionWidgetConfiguration(_: GeneralWidget<SectionWidget>): JSX.Element {
  return <div />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SectionWidgetComponent(_: GeneralWidget<SectionWidget>): JSX.Element {
  return <div className="section-widget" />;
}

const SectionBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as Widget<SectionWidget>;
  return {
    controls: <SectionWidgetConfiguration {...common} widget={widg} />,
    uiElement: <SectionWidgetComponent {...common} widget={widg} />,
    materializationOptions: (): {name: string; group?: string}[] => [],
  };
};

export default SectionBuilder;
