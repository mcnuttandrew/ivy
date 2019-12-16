import React from 'react';
import {TiDelete, TiArrowDownThick, TiArrowUpThick} from 'react-icons/ti';

import DataTargetBuilderWidget from './data-target-widget';
import ListBuilderWidget from './list-widget';
import SwitchBuilderWidget from './switch-widget';
import TextBuilderWidget from './text-widget';
import SliderBuilderWidget from './slider-widget';

import {
  TemplateWidget,
  SwitchWidget,
  ListWidget,
  DataTargetWidget,
  TextWidget,
  SliderWidget,
  TemplateMap,
} from '../../templates/types';
import {ColumnHeader} from '../../types';
import {GenericAction} from '../../actions';
import {widgetInUse} from '../../utils';

export interface GeneralWidget<T> {
  widget: T;
  idx: number;
  setWidgetValue: any;
  editMode: boolean;

  templateMap: TemplateMap;
  setTemplateValue: GenericAction;
  columns: ColumnHeader[];
}

interface Props {
  code: string;
  widget: TemplateWidget;
  idx: number;
  editMode: boolean;
  setWidgetValue: any;
  columns: ColumnHeader[];

  incrementOrder: any;
  decrementOrder: any;
  removeWidget: any;

  templateMap: TemplateMap;
  setTemplateValue: GenericAction;
}

function PlacementControls(props: Props) {
  const {
    code,
    widget,
    incrementOrder,
    decrementOrder,
    removeWidget,
    editMode,
  } = props;
  const showInUse = widget.widgetType !== 'Text';
  if (!editMode) {
    return <div />;
  }
  return (
    <div className="widget-handle">
      <div className="flex-down">
        <div className="cursor-pointer" onClick={removeWidget}>
          <TiDelete />
        </div>
        {/* <div className="cursor-pointer" onClick={decrementOrder}>
          <TiArrowUpThick />
        </div>
        <div className="cursor-pointer" onClick={incrementOrder}>
          <TiArrowDownThick />
        </div> */}
      </div>
      <div className="in-use-status">
        {showInUse
          ? widgetInUse(code, widget.widgetName)
            ? 'in use'
            : 'not used'
          : ''}
      </div>
    </div>
  );
}

export default function GeneralWidget(props: Props) {
  const {
    columns,
    editMode,
    widget,
    idx,
    setWidgetValue,
    templateMap,
    setTemplateValue,
  } = props;

  const common = {
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    setTemplateValue,
    columns,
  };
  return (
    <div className="widget flex">
      <PlacementControls {...props} />
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
