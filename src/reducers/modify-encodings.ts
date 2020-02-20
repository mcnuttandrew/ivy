import produce from 'immer';
import stringify from 'json-stringify-pretty-compact';

import {CoerceTypePayload, HandleCodePayload} from '../actions/index';
import {ActionResponse, AppState, blindSet} from './default-state';
import {fillTemplateMapWithDefaults} from './template-actions';
import {evaluateHydraProgram} from '../hydra-lang';

// remove the current encoding
export const clearEncoding: ActionResponse<void> = state => fillTemplateMapWithDefaults(state);
// blindly set a new spec
export const setNewSpec = blindSet('spec');

// set the spec code
export const setNewSpecCode: ActionResponse<HandleCodePayload> = (state, payload) => {
  const {code, inError} = payload;
  return produce(state, draftState => {
    draftState.currentTemplateInstance.code = code;
    draftState.editorError = inError;
    draftState.spec = evaluateHydraProgram(draftState.currentTemplateInstance, draftState.templateMap);
  });
};

export const coerceType: ActionResponse<CoerceTypePayload> = (state, payload) => {
  const {field, type} = payload;
  return produce(state, draftState => {
    const columnIdx = state.columns.findIndex((d: any) => d.field === field);
    draftState.columns[columnIdx].type = type;
  });
};

export const updateCodeRepresentation: ActionResponse<AppState> = (_: AppState, newState: AppState) => {
  return produce(newState, (draftState: any) => {
    draftState.specCode = stringify(newState.spec);
  });
};
