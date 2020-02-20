import React from 'react';
import {SectionWidget, Widget} from '../../types';
import {GeneralWidget, WidgetBuilder} from './general-widget';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SectionWidgetConfiguration(props: GeneralWidget<SectionWidget>): JSX.Element {
  return <div />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SectionWidgetComponent(props: GeneralWidget<SectionWidget>): JSX.Element {
  return <div className="section-widget" />;
}

const SectionBuilder: WidgetBuilder = (widget, common) => {
  const widg = widget as Widget<SectionWidget>;
  return {
    controls: <SectionWidgetConfiguration {...common} widget={widg} />,
    uiElement: <SectionWidgetComponent {...common} widget={widg} />,
  };
};

export default SectionBuilder;
