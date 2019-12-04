import React from 'react';
import {List} from 'immutable';
import {TiDelete, TiArrowDownThick, TiArrowUpThick} from 'react-icons/ti';

import DataTargetBuilderWidget from './builder-data-target-widget';
import ListBuilderWidget from './builder-list-widget';
import SwitchBuilderWidget from './builder-switch-widget';
import TextBuilderWidget from './builder-text-widget';

import {
  TemplateWidget,
  SwitchWidget,
  ListWidget,
  DataTargetWidget,
  TextWidget,
} from '../../constants/templates';
import {widgetInUse} from '../../utils';

interface BuilderWidgetProps {
  code: string;
  widget: TemplateWidget;
  widgets: List<TemplateWidget>;
  idx: number;
  setWidgets: any;
  setWidgetValue: any;
}

export default function BuilderWidget(props: BuilderWidgetProps) {
  const {code, widgets, widget, idx, setWidgets, setWidgetValue} = props;
  const showInUs = widget.widgetType !== 'Text';
  return (
    <div key={`${widget.widgetName}-${idx}`} className="widget">
      <div className="widget-handle">
        <div className="flex-down">
          <div
            className="cursor-pointer"
            onClick={() => {
              setWidgets(widgets.filter((_, jdx) => jdx !== idx));
            }}
          >
            <TiDelete />
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              if (idx === 0) {
                return;
              }
              setWidgets(
                widgets.set(idx - 1, widget).set(idx, widgets.get(idx - 1)),
              );
            }}
          >
            <TiArrowUpThick />
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              if (idx === widgets.size - 1) {
                return;
              }
              setWidgets(
                widgets.set(idx + 1, widget).set(idx, widgets.get(idx + 1)),
              );
            }}
          >
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
          <SwitchBuilderWidget
            widget={widget as SwitchWidget}
            idx={idx}
            setWidgetValue={setWidgetValue}
          />
        )}
        {widget.widgetType === 'List' && (
          <ListBuilderWidget
            widget={widget as ListWidget}
            idx={idx}
            setWidgetValue={setWidgetValue}
          />
        )}
        {widget.widgetType === 'Text' && (
          <TextBuilderWidget
            widget={widget as TextWidget}
            idx={idx}
            setWidgetValue={setWidgetValue}
          />
        )}
        {widget.widgetType === 'DataTarget' && (
          <DataTargetBuilderWidget
            widget={widget as DataTargetWidget}
            idx={idx}
            setWidgetValue={setWidgetValue}
          />
        )}
      </div>
    </div>
  );
}
