import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {Spec} from 'vega-typings';
import {ColumnHeader} from '../types';

interface Store {
  spec: Spec;
  data: any;
  columns: ColumnHeader[];
}
interface ActionResponse {
  (state: Store, payload: any): Store;
}

const DEFAULT_STATE: Store = {spec: {}, data: [], columns: []};

const actionFuncMap: {[val: string]: ActionResponse} = {};
const NULL_ACTION: ActionResponse = (state: Store): Store => state;

export default createStore(
  combineReducers({
    base: (
      state: Store = DEFAULT_STATE,
      {type, payload}: {type: string, payload: any},
    ) => {
      return (actionFuncMap[type] || NULL_ACTION)(state, payload);
    },
  }),
  applyMiddleware(thunk),
);
