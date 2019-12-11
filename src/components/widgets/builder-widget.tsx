import React from 'react';
import {TiDelete, TiArrowDownThick, TiArrowUpThick} from 'react-icons/ti';

import DataTargetBuilderWidget from './builder-data-target-widget';
import ListBuilderWidget from './builder-list-widget';
import SwitchBuilderWidget from './builder-switch-widget';
import TextBuilderWidget from './builder-text-widget';
import SliderBuilderWidget from './builder-slider-widget';

import {
  TemplateWidget,
  SwitchWidget,
  ListWidget,
  DataTargetWidget,
  TextWidget,
  SliderWidget,
} from '../../templates/types';
import {widgetInUse} from '../../utils';

interface BuilderWidgetProps {
  code: string;
  widget: TemplateWidget;
  idx: number;
  setWidgetValue: any;

  incrementOrder: any;
  decrementOrder: any;
  removeWidget: any;
}

export default function BuilderWidget(props: BuilderWidgetProps) {
  const {
    code,
    widget,
    idx,
    setWidgetValue,
    incrementOrder,
    decrementOrder,
    removeWidget,
  } = props;

  const showInUs = widget.widgetType !== 'Text';
  const common = {idx, setWidgetValue};
  return (
    <div className="widget">
      <div className="widget-handle">
        <div className="flex-down">
          <div className="cursor-pointer" onClick={removeWidget}>
            <TiDelete />
          </div>
          <div className="cursor-pointer" onClick={decrementOrder}>
            <TiArrowUpThick />
          </div>
          <div className="cursor-pointer" onClick={incrementOrder}>
            <TiArrowDownThick />
          </div>
        </div>
        <div className="in-use-status">
          {showInUs
            ? widgetInUse(code, widget.widgetName)
              ? 'in use'
              : 'not used'
            : ''}
        </div>
      </div>
      <div className="widget-body">
        {widget.widgetType === 'Switch' && (
          <SwitchBuilderWidget widget={widget as SwitchWidget} {...common} />
        )}
        {widget.widgetType === 'List' && (
          <ListBuilderWidget widget={widget as ListWidget} {...common} />
        )}
        {widget.widgetType === 'Text' && (
          <TextBuilderWidget widget={widget as TextWidget} {...common} />
        )}
        {widget.widgetType === 'DataTarget' && (
          <DataTargetBuilderWidget
            widget={widget as DataTargetWidget}
            {...common}
          />
        )}
        {widget.widgetType === 'Slider' && (
          <SliderBuilderWidget widget={widget as SliderWidget} {...common} />
        )}
      </div>
    </div>
  );
}
