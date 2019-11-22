import Immutable, {Map} from 'immutable';

import {
  findField,
  getAllInUseFields,
  extractFieldStringsForType,
  checkEncodingForValidity,
} from '../utils';
import {ActionResponse, EMPTY_SPEC} from './default-state';
import {TYPE_TRANSLATE} from './apt-actions';

const usingNestedSpec = (state: any): boolean =>
  Boolean(state.getIn(['spec', 'spec']));

// remove the current encoding
export const clearEncoding: ActionResponse = state =>
  state.set('spec', EMPTY_SPEC);

// change the mark type
export const changeMarkType: ActionResponse = (state, payload) => {
  const route = usingNestedSpec
    ? ['spec', 'spec', 'mark', 'type']
    : ['spec', 'mark', 'type'];
  if (!state.getIn(route)) {
    return state.setIn(
      ['spec', 'mark'],
      Immutable.fromJS({
        ...state.getIn(['spec', 'mark']).toJS(),
        type: payload,
      }),
    );
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
    return state.set('specCode', code).set('editorError', inError);
  }
  const parsedCode = JSON.parse(code);
  const isValid = checkEncodingForValidity(parsedCode);
  return state
    .set('specCode', code)
    .set('unprouncableInGrammer', !isValid)
    .set('editorError', null)
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
  return state.setIn(['spec', 'repeat', target], Immutable.fromJS(repeats));
};

const createStackItem = (state: any) => {
  return Map({
    spec: state.get('spec'),
    currentView: state.get('currentView'),
    templateMap: state.get('templateMap'),
    views: state.get('views'),
  });
};

const applyStackItemToState = (state: any, stackItem: any) => {
  return state
    .set('spec', stackItem.get('spec'))
    .set('currentView', stackItem.get('currentView'))
    .set('templateMap', stackItem.get('templateMap'))
    .set('views', stackItem.get('views'));
};
// takes in an old state (via a wrapping function) and an updated state and push the contents
// of the old state into the undo stack
export function pushToUndoStack(oldState: any, newState: any) {
  return newState
    .set('undoStack', newState.get('undoStack').push(createStackItem(oldState)))
    .set('redoStack', Immutable.fromJS([]));
}
// TODO these are probably constructable as a single more elegant function
export const triggerRedo: ActionResponse = state => {
  const undoStack = state.get('undoStack');
  const redoStack = state.get('redoStack');
  return applyStackItemToState(state, redoStack.last())
    .set('redoStack', redoStack.pop())
    .set('undoStack', undoStack.push(createStackItem(state)));
};

export const triggerUndo: ActionResponse = state => {
  const undoStack = state.get('undoStack');
  const redoStack = state.get('redoStack');
  return applyStackItemToState(state, undoStack.last())
    .set('undoStack', undoStack.pop())
    .set('redoStack', redoStack.push(createStackItem(state)));
};
