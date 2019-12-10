import Immutable from 'immutable';
import {
  Template,
  TemplateWidget,
  TemplateMap,
  DataTargetWidget,
} from '../templates/types';
import {ActionResponse} from './default-state';
import {setTemplateValue} from './template-actions';
import {findField} from '../utils';

export const TYPE_TRANSLATE: {[s: string]: string} = {
  DIMENSION: 'nominal',
  MEASURE: 'quantitative',
  TIME: 'temporal',
};

const positionPrefs = ['x', 'y'];
const commonPrefs = ['text', 'column', 'rows'];
// listings inspired by APT
const dimensionFieldPreferences = [
  ...positionPrefs,
  'color',
  'shape',
  'detail',
  'size',
  ...commonPrefs,
];
const measureFieldPreferences = [
  ...positionPrefs,
  'size',
  'color',
  'shape',
  'detail',
  ...commonPrefs,
];
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
  const encoding = state.getIn(['spec', 'encoding']).toJS();
  const column = findField(state, payload.field);
  const fields =
    column.type === 'DIMENSION'
      ? dimensionFieldPreferences
      : measureFieldPreferences;
  const channel = fields.find(field => {
    return !encoding[field] || JSON.stringify(encoding[field]) === '{}';
  });
  // TODO add messaging about not being able to find a place to put the thing
  if (!channel) {
    return state;
  }
  encoding[channel] = {
    field: payload.field,
    type: guessType(channel, column.type),
  };
  return state.setIn(['spec', 'encoding'], Immutable.fromJS(encoding));
};

const templateBasedGuess: ActionResponse = (state, payload) => {
  const template = state.get('currentTemplateInstance').toJS();
  const templateMap: TemplateMap = state.get('templateMap').toJS();
  const column = findField(state, payload.field);
  const openDropTargets = template.widgets
    // select just the open drop targets
    .filter(
      (widget: TemplateWidget) =>
        widget.widgetType === 'DataTarget' && !templateMap[widget.widgetName],
    )
    // and that allow the type of drop column
    .filter((widget: DataTargetWidget) =>
      widget.allowedTypes.find((type: string) => type === column.type),
    );
  if (!openDropTargets.length) {
    // TODO add messaging about this
    return state;
  }

  return setTemplateValue(state, {
    field: openDropTargets[0].widgetName,
    text: `"${payload.field}"`,
  });
};

export const addToNextOpenSlot: ActionResponse = (state, payload) => {
  const encodingMode = state.get('encodingMode');
  return (encodingMode !== 'grammer' ? templateBasedGuess : grammarBasedGuess)(
    state,
    payload,
  );
};
