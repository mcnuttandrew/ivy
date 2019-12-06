import {get, set, clear} from 'idb-keyval';
import Immutable, {Map} from 'immutable';
import {ActionResponse} from './default-state';
import {
  Template,
  TemplateMap,
  TemplateWidget,
  ListWidget,
  SwitchWidget,
  DataTargetWidget,
} from '../constants/templates';
import {getTemplate} from '../utils';

const setTemplateValues = (code: string, templateMap: TemplateMap) => {
  return Object.entries(templateMap).reduce((acc: string, keyValue: any) => {
    const [key, value] = keyValue;
    const reg = new RegExp(`"\\[${key}\\]"`, 'g');
    return acc.replace(reg, value || `[${key}]`);
  }, code);
};

// for template map holes that are NOT dimensions, fill em as best you can
export function fillTemplateMapWithDefaults(state: any) {
  const template = getTemplate(state, state.get('encodingMode'));
  // const widgets =
  const filledInTemplateMap = template.widgets
    .filter((widget: TemplateWidget) => widget.widgetType !== 'DataTarget')
    .reduce((acc: any, w: TemplateWidget) => {
      let value = null;
      if (w.widgetType === 'Text') {
        return acc;
      }
      if (w.widgetType === 'List') {
        value = (w as ListWidget).defaultValue;
      }
      if (w.widgetType === 'Switch') {
        value = (w as SwitchWidget).defaultsToActive
          ? (w as SwitchWidget).activeValue
          : (w as SwitchWidget).inactiveValue;
      }
      return acc.set(w.widgetName, value);
    }, Immutable.fromJS({}));
  const newState = state.set('templateMap', filledInTemplateMap);
  const updatedTemplate = JSON.parse(
    setTemplateValues(template.code, newState.get('templateMap').toJS()),
  );
  return newState.set('spec', Immutable.fromJS(updatedTemplate));
}

export function checkIfMapComplete(
  template: Template,
  templateMap: TemplateMap,
) {
  const requiredFields = template.widgets
    .filter(
      d => d.widgetType === 'DataTarget' && (d as DataTargetWidget).required,
    )
    .map(d => d.widgetName);
  const filledInFields = requiredFields
    .map((fieldName: string) => templateMap[fieldName])
    .filter((d: any) => d);
  return filledInFields.length === requiredFields.length;
}

export const recieveTemplates: ActionResponse = (state, payload) => {
  return state.set('templates', payload);
};

export const setTemplateValue: ActionResponse = (state, payload) => {
  let newState = state;
  if (payload.containingShelf) {
    newState = newState.deleteIn(['templateMap', payload.containingShelf]);
  }
  const template = getTemplate(newState, newState.get('encodingMode'));
  newState = newState.setIn(['templateMap', payload.field], payload.text);
  const updatedTemplate = JSON.parse(
    setTemplateValues(template.code, newState.get('templateMap').toJS()),
  );
  return newState.set('spec', Immutable.fromJS(updatedTemplate));
};

export const setTemplateMapValue = (
  templateMap: Map<string, any>,
  payload: any,
) => {
  let newMap = templateMap;
  if (payload.containingShelf) {
    templateMap = templateMap.delete(payload.containingShelf);
  }
  return newMap.set(payload.field, payload.text);
};

function getAndRemoveTemplate(state: any, templateName: string) {
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
