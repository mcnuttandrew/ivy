import stringify from 'json-stringify-pretty-compact';
import produce from 'immer';
import {TemplateMap} from '../templates/types';
import {ActionResponse, EMPTY_SPEC, AppState} from './default-state';

export interface ViewCatalog {
  [x: string]: ViewCatalogEntry;
}
export interface ViewCatalogEntry {
  spec: any;
  encodingMode: string;
  templateMap: TemplateMap;
}
const BLANK_CATALOG_ENTRY: ViewCatalogEntry = {
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

export const switchView: ActionResponse<string> = (state, payload) => {
  const newCatalog = state.viewCatalog[payload];
  return produce(updateCatalogView(state, state.currentView), draftState => {
    draftState.currentView = payload;
    draftState.spec = newCatalog.spec;
    draftState.specCode = stringify(newCatalog.spec);
    draftState.encodingMode = newCatalog.encodingMode;
    draftState.templateMap = newCatalog.templateMap;
  });
};

export const createNewView: ActionResponse<void> = state => {
  const newViewName = `view${state.views.length + 1}`;
  const newState = produce(state, draftState => {
    draftState.views = state.views.concat(newViewName);
    draftState.viewCatalog[newViewName] = BLANK_CATALOG_ENTRY;
  });
  return switchView(newState, newViewName);
};
export const deleteView: ActionResponse<string> = (state, payload) => {
  return produce(state, draftState => {
    draftState.views = state.views.filter(view => view !== payload);
    delete draftState.viewCatalog[payload];
  });
};

export const changeViewName: ActionResponse<{idx: number; value: string}> = (state, {idx, value}) => {
  return produce(state, draftState => {
    const oldViewName = draftState.views[idx];
    draftState.viewCatalog[value] = draftState.viewCatalog[oldViewName];
    delete draftState.viewCatalog[draftState.views[idx]];
    draftState.views[idx] = value;
    if (draftState.currentView === oldViewName) {
      draftState.currentView = value;
    }
  });
};

export const cloneView: ActionResponse<void> = state => {
  const newViewName = `view${state.views.length + 1}`;
  const updatedState = updateCatalogView(state, state.currentView);
  const newState = produce(state, draftState => {
    draftState.views = updatedState.views.concat(newViewName);
    draftState.viewCatalog[newViewName] = updatedState.viewCatalog[state.currentView];
  });

  return switchView(newState, newViewName);
};
