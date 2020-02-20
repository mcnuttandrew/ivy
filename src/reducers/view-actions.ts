import stringify from 'json-stringify-pretty-compact';
import produce from 'immer';
import {TemplateMap, Template} from '../templates/types';
import {ActionResponse, AppState} from './default-state';
import GALLERY from '../templates/example-templates/gallery';
import {constructDefaultTemplateMap, evaluateHydraProgram} from '../hydra-lang';

export interface ViewCatalog {
  [x: string]: ViewCatalogEntry;
}
export interface ViewCatalogEntry {
  spec: any;
  encodingMode: string;
  templateMap: TemplateMap;
  currentTemplateInstance: Template;
}
const BLANK_TEMPLATE_MAP = constructDefaultTemplateMap(GALLERY);
const BLANK_CATALOG_ENTRY: ViewCatalogEntry = {
  spec: evaluateHydraProgram(GALLERY, BLANK_TEMPLATE_MAP),
  encodingMode: GALLERY.templateName,
  templateMap: BLANK_TEMPLATE_MAP,
  currentTemplateInstance: GALLERY,
};
function updateCatalogView(state: AppState, view: string): AppState {
  const catalogEntry: ViewCatalogEntry = {
    spec: state.spec,
    encodingMode: state.encodingMode,
    templateMap: state.templateMap,
    currentTemplateInstance: state.currentTemplateInstance,
  };
  return produce(state, draftState => {
    draftState.viewCatalog[view] = catalogEntry;
  });
}

export const switchView: ActionResponse<string> = (state, payload) => {
  const catalogEntry = state.viewCatalog[payload];
  if (!catalogEntry) {
    return state;
  }
  return produce(updateCatalogView(state, state.currentView), draftState => {
    draftState.currentView = payload;
    draftState.spec = catalogEntry.spec;
    draftState.specCode = stringify(catalogEntry.spec);
    draftState.encodingMode = catalogEntry.encodingMode;
    draftState.currentTemplateInstance = catalogEntry.currentTemplateInstance;
    draftState.templateMap = catalogEntry.templateMap;
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
  // todo maybe need to update view catalog here?
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
