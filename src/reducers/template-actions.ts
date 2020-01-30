import {get, set} from 'idb-keyval';
import produce from 'immer';
import {ActionResponse, AppState, blindSet} from './default-state';
import {
  ModifyValueOnTemplatePayload,
  MoveWidgetPayload,
  HandleCodePayload,
  SetTemplateValuePayload,
  SetWidgetValuePayload,
} from '../actions/index';
import {Template, TemplateWidget, WidgetSubType, TemplateMap} from '../templates/types';
import {BLANK_TEMPLATE} from '../templates';
import {deserializeTemplate} from '../utils';
import {evaluateHydraProgram, constructDefaultTemplateMap} from '../hydra-lang';

// for template map holes that are NOT data columns, fill em as best you can
export function fillTemplateMapWithDefaults(state: AppState): AppState {
  return produce(state, draftState => {
    draftState.templateMap = constructDefaultTemplateMap(state.currentTemplateInstance);
    draftState.spec = evaluateHydraProgram(draftState.currentTemplateInstance, draftState.templateMap);
  });
}
export const recieveTemplates = blindSet('templates');

export const setTemplateValue: ActionResponse<SetTemplateValuePayload> = (state, payload) => {
  return produce(state, draftState => {
    if (payload.containingShelf) {
      delete draftState.templateMap[payload.containingShelf];
    }
    draftState.templateMap[payload.field] = payload.text;
    draftState.spec = evaluateHydraProgram(state.currentTemplateInstance, draftState.templateMap);
  });
};

export const setAllTemplateValues: ActionResponse<TemplateMap> = (state, payload) => {
  return produce(state, draftState => {
    draftState.templateMap = {...draftState.templateMap, ...payload};
  });
};

// This function is poorly named, i don't know what it does
function getAndRemoveTemplate(state: AppState, templateName: string): AppState {
  return produce(state, draftState => {
    draftState.templates = state.templates.filter(
      (template: Template) => template.templateName !== templateName,
    );
  });
}

const insertTemplateIntoTemplates: ActionResponse<Template> = (state, template) => {
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
  return produce(state, draftState => {
    draftState.templates = getAndRemoveTemplate(state, template.templateName).templates.concat(template);
  });
};

export const saveCurrentTemplate: ActionResponse<void> = state =>
  insertTemplateIntoTemplates(state, state.currentTemplateInstance);

export const loadExternalTemplate: ActionResponse<Template> = (state, payload) =>
  insertTemplateIntoTemplates(state, payload);

export const modifyValueOnTemplate: ActionResponse<ModifyValueOnTemplatePayload> = (state, payload) => {
  const {value, key} = payload;
  return produce(state, draftState => {
    /* eslint-disable @typescript-eslint/ban-ts-ignore*/
    // @ts-ignore
    draftState.currentTemplateInstance[key] = value;
    /* eslint-enable @typescript-eslint/ban-ts-ignore*/
    if (key === 'templateName') {
      draftState.encodingMode = value;
    }
    if (key === 'code') {
      draftState.editorError = payload.editorError;
    }
  });
};

export const readInTemplate: ActionResponse<HandleCodePayload> = (state, payload) => {
  if (payload.inError) {
    return produce(state, draftState => {
      draftState.editorError = payload.inError;
    });
  }
  return produce(state, draftState => {
    const updatedTemplate = deserializeTemplate(payload.code);
    updatedTemplate.code = state.currentTemplateInstance.code;
    draftState.currentTemplateInstance = updatedTemplate;
    draftState.editorError = payload.inError;
  });
};

export const readInTemplateMap: ActionResponse<HandleCodePayload> = (state, payload) => {
  if (payload.inError) {
    return produce(state, draftState => {
      draftState.editorError = payload.inError;
    });
  }
  return produce(state, draftState => {
    draftState.templateMap = JSON.parse(payload.code);
    draftState.editorError = payload.inError;
  });
};

export const setBlankTemplate: ActionResponse<boolean> = (state, fork) => {
  const currentCode = (state.currentTemplateInstance && state.currentTemplateInstance.code) || state.specCode;
  const newTemplate = JSON.parse(JSON.stringify(BLANK_TEMPLATE));
  if (fork) {
    newTemplate.code = currentCode;
  }
  return produce(state, draftState => {
    draftState.currentTemplateInstance = newTemplate;
    draftState.encodingMode = BLANK_TEMPLATE.templateName;
  });
};

export const deleteTemplate: ActionResponse<string> = (state, payload) => {
  // update the template catalog / create it
  get('templates').then((templates: string[]) => {
    const updatedTemplates = (templates || []).filter((x: string) => x !== payload);
    set('templates', updatedTemplates);
  });
  set(payload, null);
  // TODO check if current template is the one deleted?
  return produce(state, draftState => {
    draftState.templates = getAndRemoveTemplate(state, payload).templates;
  });
};

export const setWidgetValue: ActionResponse<SetWidgetValuePayload> = (state, payload) => {
  const {key, value, idx} = payload;
  // const template = state.currentTemplateInstance;
  const code = state.currentTemplateInstance.code;
  return produce(state, draftState => {
    if (key === 'widgetName') {
      // update the old code with the new name

      const widget = draftState.currentTemplateInstance.widgets[idx];
      const oldName = widget.widgetName;
      /* eslint-disable @typescript-eslint/ban-ts-ignore*/
      // @ts-ignore
      const oldValue = `\\[${widget[key]}\\]`;
      /* eslint-enable @typescript-eslint/ban-ts-ignore*/
      const re = new RegExp(oldValue, 'g');
      draftState.currentTemplateInstance.code = code.replace(re, `[${value}]`);
      draftState.currentTemplateInstance.widgets[idx].widgetName = value;

      // update the template map with the new name
      draftState.templateMap[value] = state.templateMap[oldName];
      delete draftState.templateMap[oldName];
    } else if (key === 'displayName') {
      // display name is a property of the widget container and not the widget parameter...
      draftState.currentTemplateInstance.widgets[idx].displayName = value;
    } else {
      /* eslint-disable @typescript-eslint/ban-ts-ignore*/
      // @ts-ignore
      draftState.currentTemplateInstance.widgets[idx].widget[key] = value;
      /* eslint-enable @typescript-eslint/ban-ts-ignore*/
    }
  });
};

// hey it's a lense
type WidgetMod = (x: TemplateWidget<WidgetSubType>[]) => TemplateWidget<WidgetSubType>[];
const modifyCurrentWidgets = (state: AppState, mod: WidgetMod): AppState =>
  produce(state, draftState => {
    draftState.currentTemplateInstance.widgets = mod(state.currentTemplateInstance.widgets);
  });
export const addWidget: ActionResponse<TemplateWidget<any>> = (state, payload) =>
  modifyCurrentWidgets(state, d => d.concat(payload));
export const removeWidget: ActionResponse<number> = (state, payload) =>
  modifyCurrentWidgets(state, d => d.filter((_: any, idx: number) => payload !== idx));

export const moveWidget: ActionResponse<MoveWidgetPayload> = (state, payload) => {
  const {fromIdx, toIdx} = payload;
  if (fromIdx === undefined || toIdx === undefined) {
    return state;
  }
  return modifyCurrentWidgets(state, d => {
    const withoutIdx = d.filter((_, idx) => idx !== fromIdx);
    withoutIdx.splice(toIdx, 0, d[fromIdx]);
    return withoutIdx;
  });
};
