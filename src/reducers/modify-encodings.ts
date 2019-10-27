import Immutable, {Map} from 'immutable';

import {findField} from '../utils';
import {ActionResponse, EMPTY_SPEC} from './default-state';

const TYPE_TRANSLATE: {[s: string]: string} = {
  DIMENSION: 'ordinal',
  MEASURE: 'quantitative',
  TIME: 'temporal',
};

export const addToNextOpenSlot: ActionResponse = (state, payload) => {
  // TODO this needs to be done smarter, see if the aglorithm can be copied form polestar
  const encoding = state.getIn(['spec', 'encoding']).toJS();
  const targetField = [
    'x',
    'y',
    'size',
    'color',
    'shape',
    'detail',
    'text',
    'column',
    'rows',
  ].find(field => {
    return !encoding[field] || JSON.stringify(encoding[field]) === '{}';
  });
  // TODO add messaging about not being able to find a place to put the thing
  if (!targetField) {
    return state;
  }
  encoding[targetField] = {
    field: payload.field,
    type: TYPE_TRANSLATE[findField(state, payload.field).type],
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
