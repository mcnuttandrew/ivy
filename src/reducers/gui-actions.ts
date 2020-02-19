import produce from 'immer';

import {ActionResponse, AppState, EMPTY_SPEC_BY_LANGUAGE, toggle, blindSet} from './default-state';
import {getTemplate} from '../utils';
import {JSON_OUTPUT} from '../constants/index';

import {evaluateHydraProgram} from '../hydra-lang';
import {addToNextOpenSlot} from './apt-actions';
import {fillTemplateMapWithDefaults} from './template-actions';
import {getAllInUseFields, makeColNameMap} from '../utils';

export const toggleDataModal = toggle('dataModalOpen');
export const toggleProgramModal = toggle('programModalOpen');

export const setProgrammaticView = blindSet('showProgrammaticMode');
export const changeTheme = blindSet('currentTheme');
export const setCodeMode = blindSet('codeMode');
export const setEditMode = blindSet('editMode');
export const setGuiView = blindSet('showGUIView');
export const setUserName = blindSet('userName');

// TODO there is another quote trim somewhere
const quoteTrim = (x: string): string => x.replace(/["']/g, '');

// TODO this should probably move somewhere else?
function activeColumns(state: any): string[] {
  const template = state.currentTemplateInstance;
  if (!template) {
    return Array.from(getAllInUseFields(state.spec));
  }
  const templateMap = state.templateMap;
  const templateInUse = template.widgets.reduce((acc: Set<string>, widget: any) => {
    const widgetType = widget.type;
    const val = templateMap[widget.name];
    // we only care about the data containing columns
    if (widgetType === 'MultiDataTarget') {
      return (val || []).reduce((mem: Set<string>, key: string) => mem.add(key), acc);
    }
    if (widgetType === 'DataTarget' && val) {
      return acc.add(val);
    }

    return acc;
  }, new Set());
  return Array.from(templateInUse).map((key: string) => quoteTrim(key));
}

export const applyEncodingModeToState: ActionResponse<{mode: string; fillWithDefault: boolean}> = (
  state,
  {mode, fillWithDefault},
) => {
  if (!mode) {
    return produce(state, draftState => {
      draftState.encodingMode = mode;
      draftState.spec = {};
      draftState.currentTemplateInstance = null;
    });
  }
  if (mode !== 'grammer') {
    // INSTANTIATE TEMPLATE AS A LOCAL COPY
    const template = getTemplate(state, mode);
    const updatedState = produce(state, draftState => {
      draftState.encodingMode = mode;
      draftState.spec = evaluateHydraProgram(template, state.templateMap);
      draftState.currentTemplateInstance = template;
    });
    return fillWithDefault ? fillTemplateMapWithDefaults(updatedState) : updatedState;
  }
  return produce(state, draftState => {
    draftState.encodingMode = mode;
    draftState.spec = EMPTY_SPEC_BY_LANGUAGE['vega-lite'];
    draftState.currentTemplateInstance = null;
  });
};

export const setEncodingMode: ActionResponse<string> = (state, payload) => {
  const newState = applyEncodingModeToState(
    produce(state, draftState => {
      draftState.editMode = false;
      draftState.codeMode = JSON_OUTPUT;
    }),
    {mode: payload, fillWithDefault: true},
  );

  // figure out what the currently in use columns are and iteratively try to add them to the new one
  const columnMap = makeColNameMap(newState.columns);
  return activeColumns(state)
    .filter(k => columnMap[k] && !columnMap[k].metaColumn)
    .reduce((acc: AppState, k) => addToNextOpenSlot(acc, columnMap[k]), newState);
};
