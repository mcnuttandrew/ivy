import {
  TemplateWidget,
  TemplateMap,
  DataTargetWidget,
  MultiDataTargetWidget,
  WidgetSubType,
} from '../templates/types';
import {ActionResponse} from './default-state';
import {setTemplateValue} from './template-actions';
import {findField} from '../utils';
import produce from 'immer';

export const TYPE_TRANSLATE: {[s: string]: string} = {
  DIMENSION: 'nominal',
  MEASURE: 'quantitative',
  TIME: 'temporal',
};

const positionPrefs = ['x', 'y'];
const commonPrefs = ['text', 'column', 'rows'];
// listings inspired by APT
const dimensionFieldPreferences = [...positionPrefs, 'color', 'shape', 'detail', 'size', ...commonPrefs];
const measureFieldPreferences = [...positionPrefs, 'size', 'color', 'shape', 'detail', ...commonPrefs];
type setMap = {[s: string]: boolean};

const usuallyContinuous: setMap = {
  x: true,
  y: true,
  size: true,
};
// roughly follow APT for automatic suggestion
function guessType(channel: string, type: string): string {
  if (type === 'DIMENSION') {
    return usuallyContinuous[channel] ? 'ordinal' : 'nominal';
  }
  return TYPE_TRANSLATE[type];
}

const grammarBasedGuess: ActionResponse = (state, payload) => {
  // TODO this needs to be done smarter, see if the aglorithm can be copied form polestar
  const encoding = state.spec.encoding;
  const column = findField(state, payload.field);
  const fields = column.type === 'DIMENSION' ? dimensionFieldPreferences : measureFieldPreferences;
  const channel = fields.find(field => {
    return !encoding[field] || JSON.stringify(encoding[field]) === '{}';
  });
  // TODO add messaging about not being able to find a place to put the thing
  if (!channel) {
    return state;
  }
  return produce(state, draftState => {
    draftState.spec.encoding[channel] = {
      field: payload.field,
      type: guessType(channel, column.type),
    };
  });
};

const templateBasedGuess: ActionResponse = (state, payload) => {
  const template = state.currentTemplateInstance;
  const templateMap: TemplateMap = state.templateMap;
  const column = findField(state, payload.field);

  const openDropTargets = template.widgets
    // select just the open drop targets
    .filter(
      (widget: TemplateWidget<WidgetSubType>) =>
        widget.widgetType === 'DataTarget' && !templateMap[widget.widgetName],
    )
    // and that allow the type of drop column
    .filter((widget: TemplateWidget<DataTargetWidget>) =>
      widget.widget.allowedTypes.find((type: string) => type === column.type),
    );

  const openMultiDropTargets = template.widgets
    // select just the open drop targets
    .filter((widget: TemplateWidget<WidgetSubType>) => widget.widgetType === 'MultiDataTarget')
    // and that allow the type of drop column
    .filter(
      (widget: TemplateWidget<MultiDataTargetWidget>) =>
        widget.widget.allowedTypes.find((type: string) => type === column.type) &&
        (templateMap[widget.widgetName] || []).length < widget.widget.maxNumberOfTargets,
    );
  const targets = [].concat(openDropTargets).concat(openMultiDropTargets);
  if (!targets.length) {
    // TODO add messaging about this
    return state;
  }
  const selectedWidget = targets[0];
  if (selectedWidget.widgetType === 'MultiDataTarget') {
    const oldVal = templateMap[selectedWidget.widgetName] || [];
    return setTemplateValue(state, {
      field: selectedWidget.widgetName,
      text: (oldVal as string[]).filter((key: any) => key !== payload.field).concat([payload.field]),
    });
  }
  // else is single drop target
  return setTemplateValue(state, {
    field: selectedWidget.widgetName,
    text: `"${payload.field}"`,
  });
};

export const addToNextOpenSlot: ActionResponse = (state, payload) => {
  const encodingMode = state.encodingMode;
  return (encodingMode !== 'grammer' ? templateBasedGuess : grammarBasedGuess)(state, payload);
};
