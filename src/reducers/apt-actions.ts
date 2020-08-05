import {
  ActionResponse,
  Widget,
  TemplateMap,
  DataTargetWidget,
  MultiDataTargetWidget,
  GenWidget,
} from '../types';
import {setTemplateValue} from './template-actions';
import {getOrMakeColumn, toSet} from '../utils';
import {applyQueries} from '../ivy-lang';

export const addToNextOpenSlot: ActionResponse<{field: string}> = (state, payload) => {
  const template = state.currentTemplateInstance;
  const templateMap: TemplateMap = state.templateMap;
  const column = getOrMakeColumn(payload.field, state.columns, template.customCards || []);
  const allowedWidgets = toSet(applyQueries(template, templateMap));
  const widgets = template.widgets.filter(widget => allowedWidgets.has(widget.name));
  const openDropTargets = widgets
    // select just the open drop targets
    .filter((widget: GenWidget) => widget.type === 'DataTarget' && !templateMap.paramValues[widget.name])
    // and that allow the type of drop column
    .filter(
      (widget: Widget<DataTargetWidget>) =>
        widget.config.allowedTypes.includes(column.type) || column.type === 'CUSTOM',
    );

  const openMultiDropTargets = widgets.filter((widget: GenWidget) => {
    // select just the open drop targets
    if (widget.type !== 'MultiDataTarget') {
      return false;
    }
    // and that allow the type of drop column
    const {allowedTypes, maxNumberOfTargets} = widget.config as MultiDataTargetWidget;
    const multiTargetContainsDesiredType = allowedTypes.includes(column.type) || column.type === 'CUSTOM';
    // and have space
    const hasSpace =
      (templateMap.paramValues[widget.name] || []).length < maxNumberOfTargets || !maxNumberOfTargets;
    // and doesn't current contain the new value
    const containsOldValue = templateMap.paramValues[widget.name].includes(payload.field);
    return multiTargetContainsDesiredType && hasSpace && !containsOldValue;
  });

  // created sorted list, this enable user defined list to define auto add algorithm
  const widgetIndex = template.widgets.reduce((acc, widget, idx) => {
    acc[widget.name] = idx;
    return acc;
  }, {} as {[x: string]: number});
  const targets = []
    .concat(openDropTargets)
    .concat(openMultiDropTargets)
    .sort((a, b) => widgetIndex[a.name] - widgetIndex[b.name]);

  if (!targets.length) {
    // TODO add messaging about this
    return state;
  }
  const selectedWidget = targets[0];
  if (selectedWidget.type === 'MultiDataTarget') {
    const oldVal = templateMap.paramValues[selectedWidget.name] || [];
    return setTemplateValue(state, {
      field: selectedWidget.name,
      text: (oldVal as string[]).filter((key: any) => key !== payload.field).concat([payload.field]),
      type: 'MultiDataTarget',
    });
  }
  // else is single drop target
  return setTemplateValue(state, {
    field: selectedWidget.name,
    text: `"${payload.field}"`,
    type: 'DataTarget',
  });
};
