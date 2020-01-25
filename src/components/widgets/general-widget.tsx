import React, {useRef} from 'react';
import {TiDelete} from 'react-icons/ti';
import {useDrag, useDrop, DropTargetMonitor} from 'react-dnd';
import {XYCoord} from 'dnd-core';

import {classnames} from '../../utils';

import {FaGripVertical} from 'react-icons/fa';

import MultiDataTargetComponent from './multi-data-target-widget';
import DataTargetWidgetComponent from './data-target-widget';
import ListWidgetComponent from './list-widget';
import SwitchWidgetComponent from './switch-widget';
import TextWidgetComponent from './text-widget';
import SliderWidgetComponent from './slider-widget';
import SectionWidgetComponent from './section-widget';

import {
  DataTargetWidget,
  ListWidget,
  MultiDataTargetWidget,
  SectionWidget,
  SliderWidget,
  SwitchWidget,
  TemplateMap,
  TemplateWidget,
  TextWidget,
  WidgetSubType,
} from '../../templates/types';
import {ColumnHeader} from '../../types';
import {GenericAction, SetTemplateValuePayload} from '../../actions';
import {widgetInUse} from '../../utils';

export interface GeneralWidget<T> {
  columns: ColumnHeader[];
  editMode: boolean;
  idx: number;
  moveWidget: (...args: any[]) => void;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: any;
  showSimpleDisplay: boolean;
  templateMap: TemplateMap;
  widget: T;
}

interface Props {
  code: string;
  columns: ColumnHeader[];
  editMode: boolean;
  idx: number;
  moveWidget: (...args: any[]) => void;
  removeWidget: any;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: any;
  showSimpleDisplay: boolean;
  templateMap: TemplateMap;
  widget: TemplateWidget<WidgetSubType>;
}

function PlacementControls(props: Props): JSX.Element {
  const {code, widget, removeWidget, editMode} = props;
  const showInUse = widget.widgetType !== 'Text';
  if (!editMode) {
    return <div />;
  }
  return (
    <div className="widget-handle flex-down">
      <div className="flex-down">
        <div className="cursor-pointer" onClick={removeWidget}>
          <TiDelete />
        </div>
      </div>
      <div className="in-use-status">
        {showInUse ? (widgetInUse(code, widget.widgetName) ? 'in use' : 'not used') : ''}
      </div>
      <div className="widget-handle-grip">
        <FaGripVertical />
      </div>
    </div>
  );
}

// dragging functionality cribbed from
// https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple?from-embed
export default function GeneralWidgetComponent(props: Props): JSX.Element {
  const {
    columns,
    editMode,
    widget,
    idx,
    setWidgetValue,
    templateMap,
    setTemplateValue,
    moveWidget,
    showSimpleDisplay,
  } = props;

  const common = {
    idx,
    setWidgetValue,
    editMode,
    templateMap,
    setTemplateValue,
    columns,
    moveWidget,
    showSimpleDisplay,
  };
  const widgetType = widget.widgetType;
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: 'WIDGET',
    hover(item: any, monitor: DropTargetMonitor) {
      if (!editMode) {
        return;
      }
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = idx;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      /* eslint-disable  @typescript-eslint/no-non-null-assertion */
      const hoverBoundingRect = ref.current!.getBoundingClientRect();
      /* eslint-enable  @typescript-eslint/no-non-null-assertion */

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveWidget(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{isDragging}, drag] = useDrag({
    item: {type: 'WIDGET', widget, idx},
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  if (editMode) {
    drag(drop(ref));
  }
  return (
    <div
      ref={ref}
      style={{opacity}}
      className={classnames({
        widget: true,
        flex: true,
        'widget-drag': isDragging,
      })}
    >
      <PlacementControls {...props} />
      <div className="widget-body">
        {widgetType === 'MultiDataTarget' && (
          <MultiDataTargetComponent widget={widget as TemplateWidget<MultiDataTargetWidget>} {...common} />
        )}
        {widgetType === 'Switch' && (
          <SwitchWidgetComponent widget={widget as TemplateWidget<SwitchWidget>} {...common} />
        )}
        {widgetType === 'List' && (
          <ListWidgetComponent widget={widget as TemplateWidget<ListWidget>} {...common} />
        )}
        {widgetType === 'Text' && (
          <TextWidgetComponent widget={widget as TemplateWidget<TextWidget>} {...common} />
        )}
        {widgetType === 'DataTarget' && (
          <DataTargetWidgetComponent widget={widget as TemplateWidget<DataTargetWidget>} {...common} />
        )}
        {widgetType === 'Slider' && (
          <SliderWidgetComponent widget={widget as TemplateWidget<SliderWidget>} {...common} />
        )}
        {widgetType === 'Section' && (
          <SectionWidgetComponent widget={widget as TemplateWidget<SectionWidget>} {...common} />
        )}
      </div>
    </div>
  );
}
