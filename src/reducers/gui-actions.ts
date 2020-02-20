import produce from 'immer';

import {ActionResponse, AppState, toggle, blindSet} from './default-state';
import {Template} from '../templates/types';
import {JSON_OUTPUT} from '../constants/index';

import {evaluateHydraProgram} from '../hydra-lang';
import {addToNextOpenSlot} from './apt-actions';
import {fillTemplateMapWithDefaults} from './template-actions';
import {makeColNameMap} from '../utils';

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
  const template: Template = state.templates.find((d: any) => d.templateName === mode);
  // INSTANTIATE TEMPLATE AS A LOCAL COPY
  const updatedState = produce(state, draftState => {
    draftState.encodingMode = mode;
    draftState.spec = evaluateHydraProgram(template, state.templateMap);
    draftState.currentTemplateInstance = template;
  });
  return fillWithDefault ? fillTemplateMapWithDefaults(updatedState) : updatedState;
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
    .filter(k => columnMap[k])
    .reduce((acc: AppState, k) => addToNextOpenSlot(acc, columnMap[k]), newState);
};
