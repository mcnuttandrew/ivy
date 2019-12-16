import {ActionResponse} from './default-state';
import {getTemplate} from '../utils';
import Immutable from 'immutable';
import {EMPTY_SPEC} from './default-state';

import {fillTemplateMapWithDefaults} from './template-actions';

export const setProgrammaticView: ActionResponse = state =>
  state.set('showProgrammaticMode', !state.get('showProgrammaticMode'));
export const toggleDataModal: ActionResponse = state =>
  state.set('dataModalOpen', !state.get('dataModalOpen'));
export const changeTheme: ActionResponse = (state, payload) =>
  state.set('currentTheme', payload);
export const toggleTemplateBuilder: ActionResponse = state =>
  state.set('templateBuilderModalOpen', !state.get('templateBuilderModalOpen'));
export const setEditMode: ActionResponse = (state, payload) =>
  state.set('editMode', payload);

export const setEncodingMode: ActionResponse = (state, payload) => {
  const newState = state.set('encodingMode', payload);
  if (payload !== 'grammer') {
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
