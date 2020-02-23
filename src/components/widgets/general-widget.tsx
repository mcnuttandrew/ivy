import React, {useRef} from 'react';
import {useDrag, useDrop, DropTargetMonitor} from 'react-dnd';
import {XYCoord} from 'dnd-core';
import {TiFlash} from 'react-icons/ti';
import Tooltip from 'rc-tooltip';

import Switch from 'react-switch';

import {switchCommon} from '../../constants';

import {TemplateMap, Widget, GenWidget, Template, ViewsToMaterialize} from '../../types';
import {ColumnHeader} from '../../types';
import {GenericAction, SetTemplateValuePayload} from '../../actions';
import {classnames} from '../../utils';
import {getDefaultValueForWidget} from '../../hydra-lang';

import WidgetConfigurationControls from './widget-configuration-controls';

import DataTargetBuilder from './data-target-widget';
import FreeTextBuilder from './free-text-widget';
import ListBuilder from './list-widget';
import MultiDataTargetBuilder from './multi-data-target-widget';
import SectionBuilder from './section-widget';
import ShortcutBuilder from './shortcuts-widget';
import SliderBuilder from './slider-widget';
import SwitchBuilder from './switch-widget';
import TextBuilder from './text-widget';

export interface GeneralWidget<T> {
  columns: ColumnHeader[];
  editMode: boolean;
  idx: number;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: any;
  template: Template;
  templateMap: TemplateMap;
  widget: Widget<T>;
}

// TODO: this is a bad type name
interface Props {
  allowedWidgets: Set<string>;
  code: string;
  columns: ColumnHeader[];
  editMode: boolean;
  idx: number;
  moveWidget: (...args: any[]) => void;
  removeWidget: any;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setWidgetValue: any;
  template: Template;
  templateMap: TemplateMap;
  viewsToMaterialize: ViewsToMaterialize;
  widget: GenWidget;
}

export type WidgetBuilder = (
  widget: GenWidget,
  common: Props,
) => {
  controls: any;
  uiElement: any;
  materializationOptions: (columns: ColumnHeader[], widget: GenWidget) => string[];
};

const builders = {
  DataTarget: DataTargetBuilder,
  FreeText: FreeTextBuilder,
  List: ListBuilder,
  MultiDataTarget: MultiDataTargetBuilder,
  Section: SectionBuilder,
  Shortcut: ShortcutBuilder,
  Slider: SliderBuilder,
  Switch: SwitchBuilder,
  Text: TextBuilder,
};

interface GenericMaterializationMenuProps {
  viewsToMaterialize: ViewsToMaterialize;
  allowedValues: string[];
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  widget: GenWidget;
}

const GenericMaterializationMenu = (props: GenericMaterializationMenuProps): null | JSX.Element => {
  const {viewsToMaterialize, allowedValues, setMaterialization, widget, setTemplateValue} = props;
  const currentView = viewsToMaterialize[widget.name] || [];
  return (
    <div>
      {allowedValues.map((val, idx) => {
        const checked = (viewsToMaterialize[widget.name] || []).includes(val);
        return (
          <div key={idx}>
            <span>{val}</span>
            <Switch
              {...switchCommon}
              checked={checked}
              onChange={(): any => {
                const newVals = checked ? currentView.filter(d => d !== val) : currentView.concat(val);
                setMaterialization({...viewsToMaterialize, [widget.name]: newVals});
                setTemplateValue({
                  field: widget.name,
                  text: newVals.length ? `"$$$MATERIALIZING"` : getDefaultValueForWidget(widget),
                });
              }}
            />
          </div>
        );
      })}
      <div className="flex">
        <button
          onClick={(): any => {
            setMaterialization({...viewsToMaterialize, [widget.name]: allowedValues});
            setTemplateValue({field: widget.name, text: `"$$$MATERIALIZING"`});
          }}
        >
          All on
        </button>
        <button
          onClick={(): any => {
            setMaterialization({...viewsToMaterialize, [widget.name]: []});
            setTemplateValue({field: widget.name, text: getDefaultValueForWidget(widget)});
          }}
        >
          All off
        </button>
      </div>
    </div>
  );
};

// dragging functionality cribbed from
// https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple?from-embed
export default function GeneralWidgetComponent(props: Props): JSX.Element {
  const {
    editMode,
    widget,
    idx,
    moveWidget,
    viewsToMaterialize,
    columns,
    setMaterialization,
    setTemplateValue,
  } = props;

  const widgetType = widget.type;
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

  const {controls, uiElement, materializationOptions} = builders[widgetType](widget, props);
  const options = materializationOptions(columns, widget);
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
      <div className="widget-body">{uiElement}</div>
      <WidgetConfigurationControls {...props} controls={controls} />
      {options.length > 0 && (
        <Tooltip
          placement="top"
          trigger="click"
          overlay={
            <div className="">
              <h3>Materialize partial views</h3>
              <GenericMaterializationMenu
                viewsToMaterialize={viewsToMaterialize}
                setMaterialization={setMaterialization}
                widget={widget}
                allowedValues={options}
                setTemplateValue={setTemplateValue}
              />
            </div>
          }
        >
          <div
            className={classnames({
              'materialize-button': true,
              'materialize-button-active':
                viewsToMaterialize[widget.name] && viewsToMaterialize[widget.name].length > 0,
            })}
          >
            <TiFlash />
          </div>
        </Tooltip>
      )}
    </div>
  );
}
