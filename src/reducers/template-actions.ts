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
} from '../templates/types';
import {trim} from '../utils';
import {setEncodingMode} from './gui-actions';

export const setTemplateValues = (code: string, templateMap: TemplateMap) => {
  const filledInSpec = Object.entries(templateMap).reduce(
    (acc: string, keyValue: any) => {
      const [key, value] = keyValue;
      if (trim(value) !== value) {
        // this supports the weird HACK required to make the interpolateion system
        // not make everything a string
        return acc
          .replace(new RegExp(`"\\[${key}\\]"`, 'g'), value || 'null')
          .replace(new RegExp(`\\[${key}\\]`, 'g'), trim(value) || 'null');
      }
      const reg = new RegExp(`"\\[${key}\\]"`, 'g');
      return acc.replace(
        reg,
        (Array.isArray(value) && JSON.stringify(value)) || value || 'null',
      );
    },
    code,
  );
  return filledInSpec;
};

// for template map holes that are NOT data columns, fill em as best you can
export function fillTemplateMapWithDefaults(state: AppState) {
  const template = state.get('currentTemplateInstance').toJS();
  // const widgets =
  const filledInTemplateMap = template.widgets
    .filter((widget: TemplateWidget) => widget.widgetType !== 'DataTarget')
    .reduce((acc: any, w: TemplateWidget) => {
      let value = null;
      if (w.widgetType === 'MultiDataTarget') {
        value = [];
      }
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

export function respondToTemplateInstanceCodeChanges(
  state: AppState,
  payload: any,
) {
  const {code, inError} = payload;

  const filledInSpec = setTemplateValues(code, state.get('templateMap').toJS());
  return state
    .setIn(['currentTemplateInstance', 'code'], code)
    .set('editorError', inError)
    .set('spec', Immutable.fromJS(JSON.parse(filledInSpec)));
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
  newState = newState.setIn(
    ['templateMap', payload.field],
    Immutable.fromJS(payload.text),
  );

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
  // set current template to the newly created one
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

// TODO i think this can be deleted
export const startTemplateEdit: ActionResponse = (state, payload) => {
  return state.set('templateBuilderModalOpen', payload);
};

export const setWidgetValue: ActionResponse = (state, payload) => {
  const {key, value, idx} = payload;
  const template = {...state.get('currentTemplateInstance')};
  const {code, widgets} = template;
  const oldWidget = widgets[idx];

  const oldValue = `\\[${oldWidget[key]}\\]`;
  const re = new RegExp(oldValue, 'g');
  template.code = key === 'widgetName' ? code.replace(re, `[${value}]`) : code;
  template.widgets[idx] = {...oldWidget, [key]: value};
  // this.setState({
  //   widgets: widgets.set(idx, {...oldWidget, [key]: value}),
  //   code: key === 'widgetName' ? code.replace(re, `[${value}]`) : code,
  // });
  return state.set('currentTemplateInstance', template);
};
