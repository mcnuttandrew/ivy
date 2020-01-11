import {get, set} from 'idb-keyval';
import Immutable, {Map} from 'immutable';
import {ActionResponse, AppState} from './default-state';
// import {setEncodingMode} from './gui-actions';
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

export const setTemplateValues = (
  code: string,
  templateMap: TemplateMap,
): string => {
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

export function templateEval(state: AppState): AppState {
  const filledInSpec = setTemplateValues(
    state.getIn(['currentTemplateInstance', 'code']),
    state.get('templateMap').toJS(),
  );
  return state.set('spec', Immutable.fromJS(JSON.parse(filledInSpec)));
}

// for template map holes that are NOT data columns, fill em as best you can
export function fillTemplateMapWithDefaults(state: AppState): AppState {
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

  return templateEval(state.set('templateMap', filledInTemplateMap));
}

export function respondToTemplateInstanceCodeChanges(
  state: AppState,
  payload: any,
): AppState {
  const {code, inError} = payload;

  const filledInSpec = setTemplateValues(code, state.get('templateMap').toJS());
  return state
    .setIn(['currentTemplateInstance', 'code'], code)
    .set('editorError', inError)
    .set('spec', Immutable.fromJS(JSON.parse(filledInSpec)));
}

export function getMissingFields(
  template: Template,
  templateMap: TemplateMap,
): string[] {
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

export function checkIfMapComplete(
  template: Template,
  templateMap: TemplateMap,
): boolean {
  const missing = getMissingFields(template, templateMap);
  return missing.length === 0;
}

export const recieveTemplates: ActionResponse = (state, payload) => {
  return state.set('templates', payload);
  // return setEncodingMode(state.set('templates', payload), '_____none_____');
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
  payload: {field: string; text: string; containingShelf?: string},
): Map<string, any> => {
  const newMap = templateMap;
  if (payload.containingShelf) {
    templateMap = templateMap.delete(payload.containingShelf);
  }
  return newMap.set(payload.field, payload.text);
};

function getAndRemoveTemplate(state: AppState, templateName: string): AppState {
  return state
    .get('templates')
    .filter((template: Template) => template.templateName !== templateName);
}

export const saveCurrentTemplate: ActionResponse = state => {
  const template = state.get('currentTemplateInstance').toJS();
  // this set and get on the db breaks encapsulation a little bit
  // update the template catalog / create it
  get('templates').then((templates: string[]) => {
    const updatedTemplates = templates || [];
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

export const setBlankTemplate: ActionResponse = (state, fork) => {
  const currentCode =
    state.getIn(['currentTemplateInstance', 'code']) || state.get('specCode');
  let newTemplate = Immutable.fromJS(BLANK_TEMPLATE);
  if (fork) {
    newTemplate = newTemplate.set('code', currentCode);
  }
  return state
    .set('currentTemplateInstance', newTemplate)
    .set('encodingMode', BLANK_TEMPLATE.templateName);
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

export const setWidgetValue: ActionResponse = (state, payload) => {
  const {key, value, idx} = payload;
  let template = state.get('currentTemplateInstance');
  let newState = state;
  const code = template.get('code');
  if (key === 'widgetName') {
    // update the old code with the new name
    const oldValue = `\\[${template.getIn(['widgets', idx, key])}\\]`;
    const re = new RegExp(oldValue, 'g');
    template = template.set('code', code.replace(re, `[${value}]`));
    newState = newState
      .deleteIn(['templateMap', oldValue])
      .setIn(['templateMap', value], state.getIn(['templateMap', oldValue]));
    // change the variable
    template = template.setIn(['widgets', idx, key], value);
  } else {
    template = template.setIn(
      ['widgets', idx, 'widget', key],
      Immutable.fromJS(value),
    );
  }
  return newState.set('currentTemplateInstance', template);
};

// hey it's a lense
type modifyWidgetLense = (state: AppState, mod: (x: any) => any) => AppState;
const modifyCurrentWidgets: modifyWidgetLense = (state, mod) =>
  state.setIn(
    ['currentTemplateInstance', 'widgets'],
    mod(state.getIn(['currentTemplateInstance', 'widgets'])),
  );
export const addWidget: ActionResponse = (state, payload) =>
  modifyCurrentWidgets(state, d => d.push(Immutable.fromJS(payload)));
export const removeWidget: ActionResponse = (state, payload) =>
  modifyCurrentWidgets(state, d => d.deleteIn([payload]));

export const moveWidget: ActionResponse = (state, payload) => {
  const {fromIdx, toIdx} = payload;
  if (fromIdx === undefined || toIdx === undefined) {
    return state;
  }
  return modifyCurrentWidgets(state, d =>
    d.delete(fromIdx).insert(toIdx, d.get(fromIdx)),
  );
};
