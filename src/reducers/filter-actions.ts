import {UpdateFilterPayload} from '../actions/index';
import {ActionResponse, ColumnHeader} from '../types';
import produce from 'immer';

export const createFilter: ActionResponse<ColumnHeader> = (state, payload) => {
  return produce(state, (draftState) => {
    let range = [];
    switch (payload.type) {
      default:
      case 'DIMENSION':
        range = Object.keys(payload.summary.unique);
        break;
      case 'TIME':
      case 'MEASURE':
        range = state.columns.find((d) => d.field === payload.field).domain;
        break;
    }
    draftState.templateMap.systemValues.dataTransforms.push({
      filter: {
        field: payload.field,
        type: payload.type,
        range,
      },
    });
  });
};

export const updateFilter: ActionResponse<UpdateFilterPayload> = (state, payload) => {
  const {newFilterValue, idx} = payload;
  return produce(state, (draftState) => {
    draftState.templateMap.systemValues.dataTransforms[idx].filter.range = newFilterValue;
  });
};

export const deleteFilter: ActionResponse<number> = (state, deleteIndex) => {
  return produce(state, (draftState) => {
    draftState.templateMap.systemValues.dataTransforms =
      draftState.templateMap.systemValues.dataTransforms.filter((_: any, idx: number) => idx !== deleteIndex);
  });
};
