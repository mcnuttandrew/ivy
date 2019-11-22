import {get, set, clear} from 'idb-keyval';
import Immutable from 'immutable';
import {ActionResponse} from './default-state';
import {Template, TemplateMap} from '../constants/templates';
import {getTemplate} from '../utils';

export const setTemplateValues = (
  template: Template,
  templateMap: TemplateMap,
) => {
  const filledInCode = Object.entries(templateMap).reduce(
    (acc: string, keyValue: any) => {
      const [key, value] = keyValue;
      const reg = new RegExp(`\\[${key}\\]`, 'g');
      console.log(reg);
      return acc.replace(reg, value || `[${key}]`);
    },
    template.code,
  );

  return JSON.parse(filledInCode);
};

function checkIfMapComplete(template: Template, templateMap: TemplateMap) {
  const requiredFields = template.widgets
    // @ts-ignore
    .filter(d => d.widgetType === 'DataTarget' && d.required)
    .map(d => d.widgetName);
  const filledInFields = requiredFields
    .map((fieldName: string) => templateMap[fieldName])
    .filter((d: any) => d);
  return filledInFields.length === requiredFields.length;
}

export const recieveTemplates: ActionResponse = (state, payload) => {
  console.log(payload);
  return state.set('templates', payload);
};

export const setTemplateValue: ActionResponse = (state, payload) => {
  let newState = state;
  if (payload.containingShelf) {
    newState = newState.deleteIn(['templateMap', payload.containingShelf]);
  }
  const template = getTemplate(newState, newState.get('encodingMode'));
  newState = newState.setIn(['templateMap', payload.field], payload.text);
  const updatedTemplate = setTemplateValues(
    template,
    newState.get('templateMap').toJS(),
  );
  console.log(updatedTemplate, '???');
  return newState.set('spec', Immutable.fromJS(updatedTemplate));
};

function getAndRemoveTemplate(state: any, templateName: string) {
  console.log('?', templateName);
  return state
    .get('templates')
    .filter((template: Template) => template.templateName !== templateName);
}

export const createTemplate: ActionResponse = (state, payload) => {
  // this set and get on the db breaks encapsulation a little bit
  // update the template catalog / create it
  get('templates').then((templates: string[]) => {
    let updatedTemplates = templates || [];
    if (!updatedTemplates.find((x: string) => x === payload.templateName)) {
      updatedTemplates.push(payload.templateName);
    }
    set('templates', updatedTemplates);
  });
  // blindly insert this template, allows for over-ride
  set(payload.templateName, payload);
  return state.set(
    'templates',
    getAndRemoveTemplate(state, payload.templateName).concat(payload),
  );
};

export const deleteTemplate: ActionResponse = (state, payload) => {
  console.log('delete', payload);
  // update the template catalog / create it
  get('templates').then((templates: string[]) => {
    const updatedTemplates = (templates || []).filter(
      (x: string) => x !== payload,
    );
    set('templates', updatedTemplates);
  });
  set(payload, null);
  return state.set('templates', getAndRemoveTemplate(state, payload));
};

export const startTemplateEdit: ActionResponse = (state, payload) => {
  return state.set('templateBuilderModalOpen', payload);
};
