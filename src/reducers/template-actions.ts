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
    .filter(d => d.required)
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

export const createTemplate: ActionResponse = (state, payload) => {
  console.log(payload);
  return state.set('templates', state.get('templates').concat(payload));
};
