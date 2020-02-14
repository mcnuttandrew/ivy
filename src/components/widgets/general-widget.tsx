import React, {useRef} from 'react';
import {TiDelete, TiCog} from 'react-icons/ti';
import {useDrag, useDrop, DropTargetMonitor} from 'react-dnd';
import {XYCoord} from 'dnd-core';
import Selector from '../selector';
import Tooltip from 'rc-tooltip';

import {classnames} from '../../utils';

import DataTargetBuilder from './data-target-widget';
import FreeTextBuilder from './free-text-widget';
import ListBuilder from './list-widget';
import MultiDataTargetBuilder from './multi-data-target-widget';
import SectionBuilder from './section-widget';
import ShortcutBuilder from './shortcuts-widget';
import SliderBuilder from './slider-widget';
import SwitchBuilder from './switch-widget';
import TextBuilder from './text-widget';

import {TemplateMap, TemplateWidget, WidgetSubType} from '../../templates/types';
import {ColumnHeader} from '../../types';
import {GenericAction, SetTemplateValuePayload} from '../../actions';
import {widgetInUse} from '../../utils';

export interface GeneralWidget<T> {
  columns: ColumnHeader[];
  idx: number;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setWidgetValue: any;
  templateMap: TemplateMap;
  widget: TemplateWidget<T>;
}

interface Props {
  allowedWidgets: Set<string>;
  code: string;
  columns: ColumnHeader[];
  editMode: boolean;
  idx: number;
  moveWidget: (...args: any[]) => void;
  removeWidget: any;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setWidgetValue: any;
  templateMap: TemplateMap;
  widget: TemplateWidget<WidgetSubType>;
}

export type WidgetBuilder = (
  widget: TemplateWidget<WidgetSubType>,
  common: Props,
) => {controls: any; uiElement: any};

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

interface PlacementControls {
  allowedWidgets: Set<string>;
  code: string;
  widget: TemplateWidget<WidgetSubType>;
  controls: JSX.Element;
  removeWidget: any;
  editMode: boolean;
}
const dontShowUsedIf = new Set(['Section', 'Text']);
function PlacementControls(props: PlacementControls): JSX.Element {
  const {allowedWidgets, code, controls, editMode, removeWidget, widget} = props;
  if (!editMode) {
    return <div />;
  }
  return (
    <div className="widget-handle flex">
      <Tooltip
        placement="right"
        trigger="click"
        overlay={
          <div className="flex-down">
            <h3>{widget.type}</h3>
            {!dontShowUsedIf.has(widget.type) && (
              <h5>{`Widget is currently ${widgetInUse(code, widget.name) ? 'in use' : 'not used'}`}</h5>
            )}
            {controls}
            <button onClick={removeWidget}>
              Delete Widget <TiDelete />
            </button>
            <h5>Validations (Logic for showing/hiding this widget)</h5>
            {(widget.validations || []).map(validation => {
              <div className="flex">
                <Selector
                  options={['show', 'hide'].map(key => ({display: key, value: key}))}
                  selectedValue={validation.queryResult}
                  onChange={(value: any): any => {
                    console.log('woah');
                  }}
                />
                <div>{validation.query}</div>
              </div>;
            })}
            <button
              onClick={(): void => {
                console.log('igh');
              }}
            >
              Add a validation
            </button>
          </div>
        }
      >
        <div className="flex-down">
          <div className="code-edit-controls-button cursor-pointer">
            <TiCog />
          </div>
          <div className="in-use-status">{allowedWidgets.has(widget.name) ? 'Shown' : 'Hidden'}</div>
        </div>
      </Tooltip>
    </div>
  );
}

// dragging functionality cribbed from
// https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple?from-embed
export default function GeneralWidgetComponent(props: Props): JSX.Element {
  const {editMode, widget, idx, moveWidget} = props;

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

  const {controls, uiElement} = builders[widgetType](widget, props);
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
      <PlacementControls {...props} controls={controls} />
    </div>
  );
}
