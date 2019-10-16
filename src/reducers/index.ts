import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import Immutable from 'immutable';

interface Store {}
interface ActionResponse {
  (state: Store, payload: any): Store;
}

const DEFAULT_STATE = Immutable.fromJS({});

const actionFuncMap: {[val: string]: ActionResponse} = {};
let NULL_ACTION: ActionResponse;
NULL_ACTION = (state: Store, payload: any): Store => state;

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
