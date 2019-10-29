import Immutable, {Map} from 'immutable';

import {findField} from '../utils';
import {ActionResponse, EMPTY_SPEC} from './default-state';

const TYPE_TRANSLATE: {[s: string]: string} = {
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
function guessType(channel: string, type: string): string {
  if (type === 'DIMENSION') {
    return usuallyContinuous[channel] ? 'ordinal' : 'nominal';
  }
  return TYPE_TRANSLATE[type];
}

export const addToNextOpenSlot: ActionResponse = (state, payload) => {
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
    type: guessType(channel, findField(state, payload.field).type),
  };
  return state.setIn(['spec', 'encoding'], Immutable.fromJS(encoding));
};

export const clearEncoding: ActionResponse = state =>
  state.set('spec', EMPTY_SPEC);
export const changeMarkType: ActionResponse = (state, payload) => {
  const route = ['spec', 'mark', 'type'];
  if (!state.getIn(route)) {
    return state.setIn(['spec', 'mark'], Immutable.fromJS({type: payload}));
  }
  return state.setIn(route, payload);
};
export const setNewSpec: ActionResponse = (state, payload) =>
  state.set('spec', Immutable.fromJS(payload));

export const setNewSpecCode: ActionResponse = (state, payload) => {
  const {code, inError} = payload;
  if (inError) {
    return state.set('specCode', code);
  }
  return state
    .set('specCode', code)
    .set('spec', Immutable.fromJS(JSON.parse(code)));
};

export const coerceType: ActionResponse = (state, payload) => {
  const {field, type} = payload;
  const columnIdx = state
    .get('columns')
    .findIndex((d: any) => d.field === field);
  return state.set(
    'columns',
    Immutable.fromJS(state.get('columns'))
      .setIn([columnIdx, 'type'], type)
      .toJS(),
  );
};

export const setEncodingParameter: ActionResponse = (state, payload) => {
  const fieldHeader = findField(state, payload.text);
  const route = ['spec', 'encoding'];
  let newState = state;
  if (fieldHeader) {
    newState = state.setIn(
      [...route, payload.field],
      Immutable.fromJS({
        field: payload.text,
        type: TYPE_TRANSLATE[fieldHeader.type],
      }),
    );
  } else {
    newState = state.setIn([...route, payload.field], Map());
  }
  if (payload.containingShelf) {
    newState = newState.setIn([...route, payload.containingShelf], Map());
  }

  return newState;
};

// takes in an old state (via a wrapping function) and an updated state and push the contents
// of the old state into the undo stack
export function pushToUndoStack(oldState: any, newState: any) {
  return newState
    .set('undoStack', newState.get('undoStack').push(oldState.get('spec')))
    .set('redoStack', Immutable.fromJS([]));
}

export const triggerRedo: ActionResponse = state => {
  const undoStack = state.get('undoStack');
  const redoStack = state.get('redoStack');
  return state
    .set('spec', redoStack.last())
    .set('redoStack', redoStack.pop())
    .set('undoStack', undoStack.push(state.get('spec')));
};

export const triggerUndo: ActionResponse = state => {
  const undoStack = state.get('undoStack');
  const redoStack = state.get('redoStack');
  return state
    .set('spec', undoStack.last())
    .set('undoStack', undoStack.pop())
    .set('redoStack', redoStack.push(state.get('spec')));
};
