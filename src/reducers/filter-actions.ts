import {UpdateFilterPayload, Filter} from '../actions/index';
// import {getUniques, getDomain, findField, get} from '../utils';
import {get} from '../utils';
// import {ColumnHeader} from '../types';
import {ActionResponse} from './default-state';
import produce from 'immer';
export const createFilter: ActionResponse<Filter> = (state, payload) => {
  // const isDim = findField(state, payload.field).type === 'DIMENSION';
  // const newFilter: any = {
  //   filter: {
  //     field: payload.field,
  //     // todo this is really slick, but we should probably be caching these values on load
  //     [isDim ? 'oneOf' : 'range']: (isDim ? getUniques : getDomain)(state.data, payload.field),
  //   },
  // };
  return produce(state, draftState => {
    const arr: any = draftState.spec.transform;
    arr.push(payload);
    draftState.spec.transform = arr;
  });
};

export const updateFilter: ActionResponse<UpdateFilterPayload> = (state, payload) => {
  const {newFilterValue, idx} = payload;
  const oneOf = ['spec', 'transform', idx, 'filter', 'oneOf'];
  if (get(state, oneOf)) {
    return produce(state, draftState => {
      draftState.spec.transform[idx].filter.oneOf = newFilterValue;
    });
  }
  return produce(state, draftState => {
    draftState.spec.transform[idx].filter.range = newFilterValue;
  });
};

export const deleteFilter: ActionResponse<number> = (state, deleteIndex) => {
  return produce(state, draftState => {
    draftState.spec.transform = draftState.spec.transform.filter(
      (_: any, idx: number) => idx !== deleteIndex,
    );
  });
};
