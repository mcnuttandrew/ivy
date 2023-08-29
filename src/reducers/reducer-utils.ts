import produce from 'immer';
import {AppState, ActionResponse} from '../types';
export const blindSet =
  (key: string): ActionResponse<any> =>
  (state, payload): AppState =>
    produce(state, (draftState) => {
      // @ts-ignore
      draftState[key] = payload;
    });
export const toggle =
  (key: string): ActionResponse<null> =>
  (state): AppState =>
    produce(state, (draftState) => {
      // @ts-ignore
      draftState[key] = !state[key];
    });
