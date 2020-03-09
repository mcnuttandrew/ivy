import {UpdateFilterPayload} from '../actions/index';
import {get} from '../utils';
import {ActionResponse, ColumnHeader} from '../types';
import produce from 'immer';

export const createFilter: ActionResponse<ColumnHeader> = (state, payload) => {
  return produce(state, draftState => {
    const isDim = payload.type === 'DIMENSION';
    const range = isDim ? Object.keys(payload.summary.unique) : [payload.summary.min, payload.summary.max];
    draftState.templateMap.systemValues.dataTransforms.push({
      filter: {field: payload.field, [isDim ? 'oneOf' : 'range']: range},
    });
  });
};

export const updateFilter: ActionResponse<UpdateFilterPayload> = (state, payload) => {
  const {newFilterValue, idx} = payload;
  const oneOf = ['templateMap', 'systemValues', 'dataTransforms', idx, 'filter', 'oneOf'];
  if (get(state, oneOf)) {
    return produce(state, draftState => {
      draftState.templateMap.systemValues.dataTransforms[idx].filter.oneOf = newFilterValue;
    });
  }
  return produce(state, draftState => {
    draftState.templateMap.systemValues.dataTransforms[idx].filter.range = newFilterValue;
  });
};

export const deleteFilter: ActionResponse<number> = (state, deleteIndex) => {
  return produce(state, draftState => {
    draftState.templateMap.systemValues.dataTransforms = draftState.templateMap.systemValues.dataTransforms.filter(
      (_: any, idx: number) => idx !== deleteIndex,
    );
  });
};
