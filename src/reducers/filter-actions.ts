import {UpdateFilterPayload, Filter} from '../actions/index';
import {get} from '../utils';
import {ActionResponse, ColumnHeader} from '../types';
import produce from 'immer';

export const createFilter: ActionResponse<ColumnHeader> = (state, payload) => {
  return produce(state, draftState => {
    const arr: any = draftState.dataTransforms;
    const isDim = payload.type === 'DIMENSION';
    console.log(payload);
    const newFilter: Filter = {
      filter: {
        field: payload.field,
        // todo this is really slick, but we should probably be caching these values on load
        // [isDim ? 'oneOf' : 'range']: (isDim ? getUniques : getDomain)(data, field),
        [isDim ? 'oneOf' : 'range']: isDim
          ? Object.keys(payload.summary.unique)
          : [payload.summary.min, payload.summary.max],
      },
    };
    arr.push(newFilter);
    draftState.dataTransforms = arr;
  });
};

export const updateFilter: ActionResponse<UpdateFilterPayload> = (state, payload) => {
  const {newFilterValue, idx} = payload;
  const oneOf = ['dataTransforms', idx, 'filter', 'oneOf'];
  if (get(state, oneOf)) {
    return produce(state, draftState => {
      draftState.dataTransforms[idx].filter.oneOf = newFilterValue;
    });
  }
  return produce(state, draftState => {
    draftState.dataTransforms[idx].filter.range = newFilterValue;
  });
};

export const deleteFilter: ActionResponse<number> = (state, deleteIndex) => {
  return produce(state, draftState => {
    draftState.dataTransforms = draftState.dataTransforms.filter(
      (_: any, idx: number) => idx !== deleteIndex,
    );
  });
};
