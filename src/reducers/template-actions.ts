import {get, set} from 'idb-keyval';
import Immutable, {Map} from 'immutable';
import {ActionResponse, AppState} from './default-state';
import {
  Template,
  TemplateMap,
  TemplateWidget,
  ListWidget,
  SwitchWidget,
  SliderWidget,
  DataTargetWidget,
} from '../constants/templates';
import {trim} from '../utils';
import {setEncodingMode} from './index';

export const setTemplateValues = (code: string, templateMap: TemplateMap) => {
  return Object.entries(templateMap).reduce((acc: string, keyValue: any) => {
    const [key, value] = keyValue;
    if (trim(value) !== value) {
      // this supports the weird HACK required to make the interpolateion system
      // not make everything a string
      return acc
        .replace(new RegExp(`"\\[${key}\\]"`, 'g'), value || 'null')
        .replace(new RegExp(`\\[${key}\\]`, 'g'), trim(value) || 'null');
    }
    const reg = new RegExp(`"\\[${key}\\]"`, 'g');
    return acc.replace(reg, value || 'null');
  }, code);
};

// for template map holes that are NOT dimensions, fill em as best you can
export function fillTemplateMapWithDefaults(state: AppState) {
  const template = state.get('currentTemplateInstance').toJS();
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
      if (w.widgetType === 'Slider') {
        value = (w as SliderWidget).defaultValue;
      }
      return acc.set(w.widgetName, value);
    }, Immutable.fromJS({}));
  const newState = state.set('templateMap', filledInTemplateMap);
  const filledInSpec = setTemplateValues(
    template.code,
    newState.get('templateMap').toJS(),
  );
  return newState.set('spec', Immutable.fromJS(JSON.parse(filledInSpec)));
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
  const template = state.get('currentTemplateInstance').toJS();
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

function getAndRemoveTemplate(state: AppState, templateName: string) {
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
  const updatedState = state.set(
    'templates',
    getAndRemoveTemplate(state, payload.templateName).concat(payload),
  );
  return setEncodingMode(updatedState, payload.templateName);
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
  // TODO check if current template is the one deleted?
  return state.set('templates', getAndRemoveTemplate(state, payload));
};

export const startTemplateEdit: ActionResponse = (state, payload) => {
  return state.set('templateBuilderModalOpen', payload);
};
