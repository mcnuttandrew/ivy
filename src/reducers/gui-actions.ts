import produce from 'immer';

import {ActionResponse, AppState, EMPTY_SPEC, toggle, blindSet} from './default-state';
import {getTemplate} from '../utils';
import {ColumnHeader} from '../types';

import {evaluateHydraProgram} from '../hydra-lang';
import {addToNextOpenSlot} from './apt-actions';
import {fillTemplateMapWithDefaults} from './template-actions';
import {getAllInUseFields} from '../utils';

export const setProgrammaticView = toggle('showProgrammaticMode');
export const toggleDataModal = toggle('dataModalOpen');
export const toggleProgramModal = toggle('programModalOpen');

export const changeTheme = blindSet('currentTheme');
export const setCodeMode = blindSet('codeMode');
export const setEditMode = blindSet('editMode');
export const setEditorFontSize = blindSet('editorFontSize');
export const setGuiView = blindSet('showGUIView');

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
    const widgetType = widget.widgetType;
    const val = templateMap[widget.widgetName];
    // we only care about the data containing columns
    if (widgetType === 'MultiDataTarget') {
      return val.reduce((mem: Set<string>, key: string) => mem.add(key), acc);
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
    draftState.spec = EMPTY_SPEC;
    draftState.currentTemplateInstance = null;
  });
};

const makeColNameMap = (columns: ColumnHeader[]): {[d: string]: ColumnHeader} =>
  columns.reduce((acc: {[d: string]: ColumnHeader}, colKey: ColumnHeader) => {
    acc[colKey.field] = colKey;
    return acc;
  }, {});

export const setEncodingMode: ActionResponse<string> = (state, payload) => {
  const newState = applyEncodingModeToState(
    produce(state, draftState => {
      draftState.editMode = false;
      draftState.codeMode = 'EXPORT TO JSON';
    }),
    {mode: payload, fillWithDefault: true},
  );

  // figure out what the currently in use columns are and iteratively try to add them to the new one
  const columnMap = makeColNameMap(newState.columns);
  return activeColumns(state).reduce((acc: AppState, k) => addToNextOpenSlot(acc, columnMap[k]), newState);
};
