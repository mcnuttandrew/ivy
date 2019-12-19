import {get, set} from 'idb-keyval';
import Immutable, {Map} from 'immutable';
import {ActionResponse, AppState, blindSet} from './default-state';
import {
  Template,
  TemplateMap,
  TemplateWidget,
  ListWidget,
  SwitchWidget,
  SliderWidget,
  DataTargetWidget,
  WidgetSubType,
} from '../templates/types';
import {BLANK_TEMPLATE} from '../templates';
import {trim} from '../utils';

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
    .filter(
      (widget: TemplateWidget<WidgetSubType>) =>
        widget.widgetType !== 'DataTarget',
    )
    .reduce((acc: any, w: TemplateWidget<WidgetSubType>) => {
      let value = null;
      if (w.widgetType === 'MultiDataTarget') {
        value = [];
      }
      if (w.widgetType === 'Text') {
        return acc;
      }
      if (w.widgetType === 'List') {
        value = (w as TemplateWidget<ListWidget>).widget.defaultValue;
      }
      if (w.widgetType === 'Switch') {
        const localW = w as TemplateWidget<SwitchWidget>;
        value = localW.widget.defaultsToActive
          ? localW.widget.activeValue
          : localW.widget.inactiveValue;
      }
      if (w.widgetType === 'Slider') {
        value = (w as TemplateWidget<SliderWidget>).widget.defaultValue;
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
  const missing = getMissingFields(template, templateMap);
  return missing.length === 0;
}

export function getMissingFields(template: Template, templateMap: TemplateMap) {
  const requiredFields = template.widgets
    .filter(
      d =>
        d.widgetType === 'DataTarget' &&
        (d as TemplateWidget<DataTargetWidget>).widget.required,
    )
    .map(d => d.widgetName);
  const missingFileds = requiredFields
    .map((fieldName: string) => ({fieldName, value: !templateMap[fieldName]}))
    .filter((d: any) => d.value)
    .map(d => d.fieldName);

  return missingFileds;
}

export const recieveTemplates = blindSet('templates');

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
//
// export const createTemplate: ActionResponse = (state, payload) => {
//   // this set and get on the db breaks encapsulation a little bit
//   // update the template catalog / create it
//   get('templates').then((templates: string[]) => {
//     let updatedTemplates = templates || [];
//     if (!updatedTemplates.find((x: string) => x === payload.templateName)) {
//       updatedTemplates.push(payload.templateName);
//     }
//     set('templates', updatedTemplates);
//   });
//   // blindly insert this template, allows for over-ride
//   set(payload.templateName, payload);
//   const updatedState = state.set(
//     'templates',
//     getAndRemoveTemplate(state, payload.templateName).concat(payload),
//   );
//   // set current template to the newly created one
//   return setEncodingMode(updatedState, payload.templateName);
// };

export const saveCurrentTemplate: ActionResponse = state => {
  const template = state.get('currentTemplateInstance').toJS();
  // this set and get on the db breaks encapsulation a little bit
  // update the template catalog / create it
  get('templates').then((templates: string[]) => {
    let updatedTemplates = templates || [];
    if (!updatedTemplates.find((x: string) => x === template.templateName)) {
      updatedTemplates.push(template.templateName);
    }
    set('templates', updatedTemplates);
  });
  // blindly insert this template, allows for over-ride
  set(template.templateName, template);
  const updatedState = state.set(
    'templates',
    getAndRemoveTemplate(state, template.templateName).concat(template),
  );
  // set current template to the newly created one
  return updatedState;
};

export const modifyValueOnTemplate: ActionResponse = (state, payload) => {
  const {value, key} = payload;
  let newState = state.setIn(['currentTemplateInstance', key], value);
  if (key === 'templateName') {
    newState = newState.set('encodingMode', value);
  }
  return newState;
};

export const setBlankTemplate: ActionResponse = state =>
  state
    .set('currentTemplateInstance', Immutable.fromJS(BLANK_TEMPLATE))
    .set('encodingMode', BLANK_TEMPLATE.templateName);

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

export const setWidgetValue: ActionResponse = (state, payload) => {
  const {key, value, idx} = payload;
  let template = state.get('currentTemplateInstance');
  let newState = state;
  const code = template.get('code');
  if (key === 'widgetName') {
    const oldValue = `\\[${template.getIn(['widgets', idx, key])}\\]`;
    const re = new RegExp(oldValue, 'g');
    template = template.set('code', code.replace(re, `[${value}]`));
    newState = newState
      .deleteIn(['templateMap', oldValue])
      .setIn(['templateMap', value], state.getIn(['templateMap', oldValue]));
  }
  template = template.setIn(['widgets', idx, key], Immutable.fromJS(value));
  return newState.set('currentTemplateInstance', template);
};

// hey it's a lense
const modifyCurrentWidgets = (state: any, mod: (x: any) => any) =>
  state.setIn(
    ['currentTemplateInstance', 'widgets'],
    mod(state.getIn(['currentTemplateInstance', 'widgets'])),
  );
export const addWidget: ActionResponse = (state, payload) =>
  modifyCurrentWidgets(state, d => d.push(payload));
export const removeWidget: ActionResponse = (state, payload) =>
  modifyCurrentWidgets(state, d => d.deleteIn([payload]));
