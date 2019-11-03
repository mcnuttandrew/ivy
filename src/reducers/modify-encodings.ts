import Immutable, {Map} from 'immutable';

import {findField} from '../utils';
import {ActionResponse, EMPTY_SPEC} from './default-state';

// function getSpecModificationTarget(state: any) {
//   if (state.getIn(['spec', 'spec'])) {
//     return {target, }
//   }
// }
//

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
  if (usingNestedSpec(state) && noMetaUsage(newState, route)) {
    return removeMetaEncoding(newState);
  }
  return newState;
};

// Katy is about to come over,
// so here's what's left in the repeater story.
//
// - add controls to the data column under the meta column pills for selecting which columns to use
//   should have modes dimension columns / measure columns / custom (this should also auto set the field type)
//        - custom then should be a check box of all columns
// - also haven't set up the "repeat" metacolumn, which requires it's own weird repeat setting

function noMetaUsage(state: any, route: string[]) {
  let containsMeta = false;
  state.getIn(route).forEach((channelEncoding: any) => {
    if (channelEncoding.getIn(['field', 'repeat'])) {
      containsMeta = true;
    }
  });
  return !containsMeta;
}

function addMetaEncoding(state: any) {
  return (
    state
      // move all of the old stuff in the new subspec
      .setIn(['spec', 'spec'], Map())
      .setIn(['spec', 'spec', 'encoding'], state.getIn(['spec', 'encoding']))
      .setIn(['spec', 'spec', 'mark'], state.getIn(['spec', 'mark']))
      .deleteIn(['spec', 'encoding'])
      .deleteIn(['spec', 'mark'])
  );
}

function removeMetaEncoding(state: any) {
  return (
    state
      // move all of the old stuff in the new subspec
      .setIn(['spec', 'encoding'], state.getIn(['spec', 'spec', 'encoding']))
      .setIn(['spec', 'mark'], state.getIn(['spec', 'spec', 'mark']))
      .deleteIn(['spec', 'spec'])
      .deleteIn(['spec', 'repeat'])
  );
}

export const setChannelToMetaColumn: ActionResponse = (state, payload) => {
  let newState = state;
  const metacolumnHeader = findField(state, payload.text, 'metaColumns');
  if (!usingNestedSpec(state)) {
    newState = addMetaEncoding(newState)
      // create repeats
      // this approach only works for column / row
      .setIn(['spec', 'repeat'], Immutable.fromJS({}));
    console.log('i set everything?');
  }
  if (!newState.getIn(['spec', 'repeat', payload.text])) {
    console.log(newState.getIn(['spec', 'repeat', payload.text]));
    newState = newState.setIn(
      ['spec', 'repeat', payload.text],
      metacolumnHeader.domain,
    );
  }
  return newState.setIn(
    ['spec', 'spec', 'encoding', payload.field],
    Immutable.fromJS({field: {repeat: payload.text}, type: 'quantitative'}),
  );
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
