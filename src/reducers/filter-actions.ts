import Immutable from 'immutable';
import {getUniques, getDomain, findField} from '../utils';
import {ActionResponse} from './default-state';

export const createFilter: ActionResponse = (state, payload) => {
  const isDim = findField(state, payload.field).type === 'DIMENSION';
  const newFilter: any = {
    filter: {
      field: payload.field,
      // todo this is really slick, but we should probably be caching these values on load
      [isDim ? 'oneOf' : 'range']: (isDim ? getUniques : getDomain)(
        state.get('data'),
        payload.field,
      ),
    },
  };

  return state.updateIn(['spec', 'transform'], (arr: any) =>
    arr.push(Immutable.fromJS(newFilter)),
  );
};

export const updateFilter: ActionResponse = (state, payload) => {
  const {newFilterValue, idx} = payload;
  const newVal = Immutable.fromJS(newFilterValue);
  const oneOf = ['spec', 'transform', idx, 'filter', 'oneOf'];
  if (state.getIn(oneOf)) {
    return state.setIn(oneOf, newVal);
  }
  return state.setIn(['spec', 'transform', idx, 'filter', 'range'], newVal);
};

export const deleteFilter: ActionResponse = (state, deleteIndex) => {
  return state.deleteIn(['spec', 'transform', deleteIndex]);
};
