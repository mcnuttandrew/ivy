import Immutable, {Map} from 'immutable';

import {
  findField,
  getAllInUseFields,
  extractFieldStringsForType,
} from '../utils';
import {ActionResponse, EMPTY_SPEC} from './default-state';

const usingNestedSpec = (state: any): boolean =>
  Boolean(state.getIn(['spec', 'spec']));

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
// roughly follow APT for automatic suggestion
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

// remove the current encoding
export const clearEncoding: ActionResponse = state =>
  state.set('spec', EMPTY_SPEC);

// change the mark type
export const changeMarkType: ActionResponse = (state, payload) => {
  const route = usingNestedSpec
    ? ['spec', 'spec', 'mark', 'type']
    : ['spec', 'mark', 'type'];
  if (!state.getIn(route)) {
    return state.setIn(['spec', 'mark'], Immutable.fromJS({type: payload}));
  }
  return state.setIn(route, payload);
};

// blindly set a new spec
export const setNewSpec: ActionResponse = (state, payload) =>
  state.set('spec', Immutable.fromJS(payload));

// set the spec code
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

function maybeRemoveRepeats(
  oldState: any,
  newState: any,
  targetChannel: string,
) {
  const route = usingNestedSpec(newState)
    ? ['spec', 'spec', 'encoding']
    : ['spec', 'encoding'];
  // figure out if target removing field is a metacolumn
  const oldField = oldState.getIn([...route, targetChannel]);
  const repeaterField = oldField.getIn(['field', 'repeat']);
  if (!repeaterField) {
    return newState;
  }
  // check to see if that column is still in use after the removal
  const inUse = getAllInUseFields(newState.getIn(['spec']));
  if (inUse.has(repeaterField)) {
    return newState;
  }
  return newState.deleteIn(['spec', 'repeat', repeaterField]);
}

function noMetaUsage(state: any): boolean {
  const inUse = getAllInUseFields(state.getIn(['spec']));
  return !(inUse.has('row') || inUse.has('column') || inUse.has('repeat'));
}

function addMetaEncoding(state: any) {
  return state
    .setIn(['spec', 'spec'], Map())
    .setIn(['spec', 'spec', 'encoding'], state.getIn(['spec', 'encoding']))
    .setIn(['spec', 'spec', 'mark'], state.getIn(['spec', 'mark']))
    .deleteIn(['spec', 'encoding'])
    .deleteIn(['spec', 'mark']);
}

function removeMetaEncoding(state: any) {
  return state
    .setIn(['spec', 'encoding'], state.getIn(['spec', 'spec', 'encoding']))
    .setIn(['spec', 'mark'], state.getIn(['spec', 'spec', 'mark']))
    .deleteIn(['spec', 'spec'])
    .deleteIn(['spec', 'repeat']);
}

export const setChannelToMetaColumn: ActionResponse = (state, payload) => {
  let newState = state;
  // moving from un-nested spec to nested spec
  if (!usingNestedSpec(state)) {
    newState = addMetaEncoding(newState).setIn(
      ['spec', 'repeat'],
      Immutable.fromJS({}),
    );
  }

  //
  // this approach only works for column / row
  // if the repeat operator has not been initialized, initialize it
  const repeatRoute = ['spec', 'repeat', payload.text];
  if (!newState.getIn(repeatRoute)) {
    newState = newState.setIn(
      repeatRoute,
      Immutable.fromJS(
        extractFieldStringsForType(state.get('columns'), 'MEASURE'),
      ),
    );
  }
  // if there is already a card in place, check to see if removing it removes the repeats
  const fieldRoute = ['spec', 'spec', 'encoding', payload.field];
  if (
    state.getIn(fieldRoute) &&
    state.getIn([...fieldRoute, 'field', 'repeat']) !== payload.text
  ) {
    newState = maybeRemoveRepeats(
      newState,
      newState.deleteIn(fieldRoute),
      payload.field,
    );
  }

  // if the card is being moved remove where it was before
  if (payload.containingShelf) {
    const delRoute = ['spec', 'spec', 'encoding', payload.containingShelf];
    newState = newState.deleteIn(delRoute);
  }

  // finally set the new field
  const newFieldVal = Immutable.fromJS({
    field: {repeat: payload.text},
    type: 'quantitative',
  });
  return newState.setIn(fieldRoute, newFieldVal);
};

// move a field from one channel to another (origin field might be null)
export const setEncodingParameter: ActionResponse = (state, payload) => {
  if (payload.isMeta) {
    return setChannelToMetaColumn(state, payload);
  }
  const fieldHeader = findField(state, payload.text);
  const route = usingNestedSpec(state)
    ? ['spec', 'spec', 'encoding']
    : ['spec', 'encoding'];
  let newState = state;
  if (fieldHeader) {
    newState = newState.setIn(
      [...route, payload.field],
      Immutable.fromJS({
        field: payload.text,
        type: TYPE_TRANSLATE[fieldHeader.type],
      }),
    );
  } else {
    // removing field
    newState = maybeRemoveRepeats(
      state,
      newState.setIn([...route, payload.field], Map()),
      payload.field,
    );
  }
  // if the card is being moved, remove where it was before
  if (payload.containingShelf) {
    newState = newState.deleteIn([...route, payload.containingShelf]);
  }
  // check if the nesting spec should be removed
  if (usingNestedSpec(state) && noMetaUsage(newState)) {
    return removeMetaEncoding(newState);
  }
  return newState;
};

// move a field from one channel to another (origin field might be null)
export const swapXAndYChannels: ActionResponse = state => {
  const route = usingNestedSpec(state)
    ? ['spec', 'spec', 'encoding']
    : ['spec', 'encoding'];
  const oldX = state.getIn([...route, 'x']);
  const oldY = state.getIn([...route, 'y']);

  return state.setIn([...route, 'x'], oldY).setIn([...route, 'y'], oldX);
};

export const setRepeats: ActionResponse = (state, payload) => {
  const {repeats, target} = payload;
  console.log('se');
  return state.setIn(['spec', 'repeat', target], Immutable.fromJS(repeats));
};

// takes in an old state (via a wrapping function) and an updated state and push the contents
// of the old state into the undo stack
export function pushToUndoStack(oldState: any, newState: any) {
  return newState
    .set('undoStack', newState.get('undoStack').push(oldState.get('spec')))
    .set('redoStack', Immutable.fromJS([]));
}
// TODO these are probably constructable as a single more elegant function
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
