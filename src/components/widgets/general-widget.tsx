import React from 'react';
import {TiDelete} from 'react-icons/ti';

import MultiDataTargetComponent from './multi-data-target-widget';
import DataTargetWidgetComponent from './data-target-widget';
import ListWidgetComponent from './list-widget';
import SwitchWidgetComponent from './switch-widget';
import TextWidgetComponent from './text-widget';
import SliderWidgetComponent from './slider-widget';

import {
  TemplateWidget,
  SwitchWidget,
  ListWidget,
  DataTargetWidget,
  TextWidget,
  SliderWidget,
  TemplateMap,
  MultiDataTargetWidget,
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

  templateMap: TemplateMap;
  setTemplateValue: GenericAction;
  removeWidget: any;
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
  const widgetType = widget.widgetType;
  return (
    <div className="widget flex">
      <PlacementControls {...props} />
      <div className="widget-body">
        {widgetType === 'MultiDataTarget' && (
          <MultiDataTargetComponent
            widget={widget as MultiDataTargetWidget}
            {...common}
          />
        )}
        {widgetType === 'Switch' && (
          <SwitchWidgetComponent widget={widget as SwitchWidget} {...common} />
        )}
        {widgetType === 'List' && (
          <ListWidgetComponent widget={widget as ListWidget} {...common} />
        )}
        {widgetType === 'Text' && (
          <TextWidgetComponent widget={widget as TextWidget} {...common} />
        )}
        {widgetType === 'DataTarget' && (
          <DataTargetWidgetComponent
            widget={widget as DataTargetWidget}
            {...common}
          />
        )}
        {widgetType === 'Slider' && (
          <SliderWidgetComponent widget={widget as SliderWidget} {...common} />
        )}
      </div>
    </div>
  );
}
