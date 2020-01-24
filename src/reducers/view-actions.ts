import stringify from 'json-stringify-pretty-compact';
import produce from 'immer';
import {ActionResponse, EMPTY_SPEC, AppState} from './default-state';

const BLANK_CATALOG_ENTRY = {
  spec: EMPTY_SPEC,
  encodingMode: 'grammer',
  templateMap: {},
};
function updateCatalogView(state: AppState, view: string): AppState {
  const catalogEntry = {
    spec: state.spec,
    encodingMode: state.encodingMode,
    templateMap: state.templateMap,
  };
  return produce(state, draftState => {
    draftState.viewCatalog[view] = catalogEntry;
  });
}

export const switchView: ActionResponse = (state, payload) => {
  const newCatalog = state.viewCatalog[payload];
  return produce(updateCatalogView(state, state.currentView), draftState => {
    draftState.currentView = payload;
    draftState.spec = newCatalog.spec;
    draftState.specCode = stringify(newCatalog.spec);
    draftState.encodingMode = newCatalog.encodingMode;
    draftState.templateMap = newCatalog.templateMap;
  });
};

export const createNewView: ActionResponse = state => {
  const newViewName = `view${state.views.length + 1}`;
  const newState = produce(state, draftState => {
    draftState.views = state.views.concat(newViewName);
    draftState.viewCatalog[newViewName] = BLANK_CATALOG_ENTRY;
  });
  return switchView(newState, newViewName);
};
export const deleteView: ActionResponse = (state, payload) => {
  console.log('TODO', payload);
  return state;
};

export const cloneView: ActionResponse = state => {
  const newViewName = `view${state.views.length + 1}`;
  const updatedState = updateCatalogView(state, state.currentView);
  const newState = produce(state, draftState => {
    draftState.views = updatedState.views.concat(newViewName);
    draftState.viewCatalog.newViewName = updatedState.viewCatalog[state.currentView];
  });

  return switchView(newState, newViewName);
};
