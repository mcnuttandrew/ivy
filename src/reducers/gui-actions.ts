import {ActionResponse} from './default-state';
import {getTemplate} from '../utils';
import Immutable from 'immutable';
import {EMPTY_SPEC, toggle, blindSet} from './default-state';

import {fillTemplateMapWithDefaults} from './template-actions';

export const setProgrammaticView = toggle('showProgrammaticMode');
export const toggleDataModal = toggle('dataModalOpen');

export const changeTheme = blindSet('currentTheme');
export const setEditMode = blindSet('editMode');
export const setCodeMode = blindSet('codeMode');

export const setEncodingMode: ActionResponse = (state, payload) => {
  const newState = state.set('encodingMode', payload);
  if (payload !== 'grammer') {
    // INSTANTIATE TEMPLATE AS A LOCAL COPY

    // this will become the local copy of the template
    const template = getTemplate(state, payload);
    const updatedSpec = Immutable.fromJS(JSON.parse(template.code));
    return fillTemplateMapWithDefaults(
      newState
        .set('currentTemplateInstance', Immutable.fromJS(template))
        .set('spec', updatedSpec),
    );
  } else {
    return newState
      .set('spec', EMPTY_SPEC)
      .set('currentTemplateInstance', null);
  }
};
