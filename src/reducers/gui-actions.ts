import Immutable, {Map} from 'immutable';

import {ActionResponse, AppState} from './default-state';
import {getTemplate} from '../utils';
import {EMPTY_SPEC, toggle, blindSet} from './default-state';
import {ColumnHeader} from '../types';

import {addToNextOpenSlot} from './apt-actions';
import {fillTemplateMapWithDefaults} from './template-actions';
import {getAllInUseFields} from '../utils';

export const setProgrammaticView = toggle('showProgrammaticMode');
export const toggleDataModal = toggle('dataModalOpen');

export const setSimpleDisplay = blindSet('showSimpleDisplay');
export const changeTheme = blindSet('currentTheme');
export const setEditMode = blindSet('editMode');
export const setCodeMode = blindSet('codeMode');

const quoteTrim = (x: string): string => x.replace(/["']/g, '');

function activeColumns(state: any): string[] {
  const template = state.get('currentTemplateInstance');
  if (!template) {
    return Array.from(getAllInUseFields(state.get('spec')));
  }
  const templateMap = state.get('templateMap');
  const templateInUse = template.get('widgets').reduce((acc: Set<string>, widget: any) => {
    const widgetType = widget.get('widgetType');
    const val = templateMap.get(widget.get('widgetName'));
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
    updatedState = state
      .set('encodingMode', payload)
      .set('spec', Immutable.fromJS(JSON.parse(template.code)))
      .set('currentTemplateInstance', Immutable.fromJS(template));
    updatedState = fillTemplateMapWithDefaults(updatedState);
  } else {
    updatedState = state
      .set('encodingMode', payload)
      .set('spec', EMPTY_SPEC)
      .set('currentTemplateInstance', null);
  }
  // figure out what the currently in use columns are and iteratively try to add them to the new one
  const columnMap = state
    .get('columns')
    .reduce((acc: any, x: ColumnHeader) => acc.set(x.field, x), Map());
  return activeColumns(state).reduce((acc: AppState, columnKey: string) => {
    return addToNextOpenSlot(acc, columnMap.get(columnKey));
  }, updatedState);
};
