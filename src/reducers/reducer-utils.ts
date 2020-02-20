import produce from 'immer';
import {AppState, ActionResponse} from '../types';
export const blindSet = (key: string): ActionResponse<any> => (state, payload): AppState =>
  produce(state, draftState => {
    /* eslint-disable @typescript-eslint/ban-ts-ignore*/
    // @ts-ignore
    draftState[key] = payload;
    /* eslint-enable @typescript-eslint/ban-ts-ignore*/
  });
export const toggle = (key: string): ActionResponse<null> => (state): AppState =>
  produce(state, draftState => {
    /* eslint-disable @typescript-eslint/ban-ts-ignore*/
    // @ts-ignore
    draftState[key] = !state[key];
    /* eslint-enable @typescript-eslint/ban-ts-ignore*/
  });
