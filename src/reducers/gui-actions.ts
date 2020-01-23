import produce from 'immer';

import {ActionResponse, AppState, EMPTY_SPEC, toggle, blindSet} from './default-state';
import {getTemplate} from '../utils';
import {ColumnHeader} from '../types';

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
export const setSimpleDisplay = blindSet('showSimpleDisplay');

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

export const setEncodingMode: ActionResponse = (state, payload) => {
  let updatedState = state;
  if (payload !== 'grammer') {
    // INSTANTIATE TEMPLATE AS A LOCAL COPY
    const template = getTemplate(state, payload);
    updatedState = produce(state, draftState => {
      draftState.encodingMode = payload;
      draftState.spec = JSON.parse(template.code);
      draftState.currentTemplateInstance = template;
    });
    // updatedState = state
    //   .set('encodingMode', payload)
    //   .set('spec', JSON.parse(template.code))
    //   .set('currentTemplateInstance', template);
    updatedState = fillTemplateMapWithDefaults(updatedState);
  } else {
    updatedState = produce(state, draftState => {
      draftState.encodingMode = payload;
      draftState.spec = EMPTY_SPEC;
      draftState.currentTemplateInstance = null;
    });
    // updatedState = state
    //   .set('encodingMode', payload)
    //   .set('spec', EMPTY_SPEC)
    //   .set('currentTemplateInstance', null);
  }
  // figure out what the currently in use columns are and iteratively try to add them to the new one
  const columnMap = state.columns.reduce((acc: {[d: string]: ColumnHeader}, x: ColumnHeader) => {
    acc[x.field] = x;
    return acc;
  }, {});
  return activeColumns(state).reduce((acc: AppState, columnKey: string) => {
    return addToNextOpenSlot(acc, columnMap[columnKey]);
  }, updatedState);
};
