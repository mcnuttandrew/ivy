import {getUniques, getDomain, findField} from '../utils';
import {ActionResponse} from './default-state';
import produce from 'immer';

export const createFilter: ActionResponse = (state, payload) => {
  const isDim = findField(state, payload.field).type === 'DIMENSION';
  const newFilter: any = {
    filter: {
      field: payload.field,
      // todo this is really slick, but we should probably be caching these values on load
      [isDim ? 'oneOf' : 'range']: (isDim ? getUniques : getDomain)(state.data, payload.field),
    },
  };
  return produce(state, draftState => {
    const arr: any = draftState.spec.transform;
    arr.push(newFilter);
    draftState.spec.transform = arr;
  });
  // return state.updateIn(['spec', 'transform'], (arr: any) => (arr || []).push(newFilter));
};

export const updateFilter: ActionResponse = (state, payload) => {
  console.log('TODO: BROKEN, TOO HARD TO DO BLIND');
  return state;
  // const {newFilterValue, idx} = payload;
  // const oneOf = ['spec', 'transform', idx, 'filter', 'oneOf'];
  // if (get(state, oneOf)) {
  //   return state.setIn(oneOf, newFilterValue);
  // }
  // return state.setIn(['spec', 'transform', idx, 'filter', 'range'], newFilterValue);
};

export const deleteFilter: ActionResponse = (state, deleteIndex) => {
  console.log('TODO: BROKEN, TOO HARD TO DO BLIND');
  return state;
  // return state.deleteIn(['spec', 'transform', deleteIndex]);
};
