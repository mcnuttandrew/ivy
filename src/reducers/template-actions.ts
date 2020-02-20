import {get, set} from 'idb-keyval';
import produce from 'immer';
import stringify from 'json-stringify-pretty-compact';
import {TEMPLATE_BODY} from '../constants';
import {blindSet} from './reducer-utils';
import {
  ModifyValueOnTemplatePayload,
  MoveWidgetPayload,
  HandleCodePayload,
  SetTemplateValuePayload,
  SetWidgetValuePayload,
} from '../actions/index';
import {ActionResponse, AppState, Template, Widget, GenWidget, TemplateMap, ListWidget} from '../types';
import {BLANK_TEMPLATE, EMPTY_SPEC_BY_LANGUAGE} from '../templates';
import {deserializeTemplate, trim} from '../utils';
import {evaluateHydraProgram, constructDefaultTemplateMap} from '../hydra-lang';
import {ColumnHeader} from '../types';

// for template map holes that are NOT data columns, fill em as best you can
export function fillTemplateMapWithDefaults(state: AppState): AppState {
  return produce(state, draftState => {
    draftState.templateMap = constructDefaultTemplateMap(state.currentTemplateInstance);
  });
}
export const recieveTemplates = blindSet('templates');

/**
 * Templates that use vega-lite often follow a specific pattern which we can usually guess some pieces of
 * This function checks the type a column thats being inserted and trys to intelligently set the type
 * of the associated channel as best it can
 * @param template
 * @param payload
 * @param templateMap
 * @param columns
 */
function tryToGuessTheTypeForVegaLite(
  template: Template,
  payload: SetTemplateValuePayload,
  templateMap: TemplateMap,
  columns: ColumnHeader[],
): void {
  if (template.templateLanguage !== 'vega-lite') {
    return;
  }
  const typeWidget = template.widgets.find(widget => widget.name === `${payload.field}Type`);
  if (!(typeWidget && payload.type === 'DataTarget')) {
    return;
  }
  const column = columns.find(col => col.field === trim(payload.text as string));
  const dims = (typeWidget.config as ListWidget).allowedValues;

  if (column && column.type === 'DIMENSION' && dims.find(d => d.display === 'nominal')) {
    templateMap[`${payload.field}Type`] = '"nominal"';
  }

  if (column && column.type === 'MEASURE' && dims.find(d => d.display === 'quantitative')) {
    templateMap[`${payload.field}Type`] = '"quantitative"';
  }

  if (column && column.type === 'TIME' && dims.find(d => d.display === 'temporal')) {
    templateMap[`${payload.field}Type`] = '"temporal"';
  }
}

function removeFirstInstanceOf(a: string[], key: string): string[] {
  let hasFound = false;
  return a
    .map(d => d)
    .filter(x => {
      if (hasFound) {
        return true;
      }
      if (x === key) {
        hasFound = true;
        return false;
      }
      return true;
    });
}

const bagDifference = (a: string[], b: string[]): string[] => b.reduce(removeFirstInstanceOf, a);

export const setTemplateValue: ActionResponse<SetTemplateValuePayload> = (state, payload) => {
  const template = state.currentTemplateInstance;
  const getWidget = (name: string): Widget<any> | null =>
    template.widgets.find(widget => widget.name === name);
  const {containingShelf} = payload;
  const fromWidget = getWidget(containingShelf);
  const toWidget = getWidget(payload.field);
  return produce(state, draftState => {
    if (containingShelf && fromWidget.type === 'DataTarget') {
      delete draftState.templateMap[containingShelf];
    }
    if (fromWidget && fromWidget.type === 'MultiDataTarget' && toWidget.type === 'MultiDataTarget') {
      const oldVal = draftState.templateMap[containingShelf] as string[];
      draftState.templateMap[containingShelf] = bagDifference(oldVal, payload.text as string[]);
    }
    if (fromWidget && fromWidget.type === 'MultiDataTarget' && toWidget.type === 'DataTarget') {
      const oldVal = draftState.templateMap[containingShelf] as string[];
      const val = removeFirstInstanceOf(oldVal, trim(payload.text as string));
      draftState.templateMap[containingShelf] = val;
    }

    draftState.templateMap[payload.field] = payload.text;
    tryToGuessTheTypeForVegaLite(
      draftState.currentTemplateInstance,
      payload,
      draftState.templateMap,
      state.columns,
    );
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

// set the spec code
export const setNewSpecCode: ActionResponse<HandleCodePayload> = (state, payload) => {
  const {code, inError} = payload;
  return produce(state, draftState => {
    draftState.currentTemplateInstance.code = code;
    draftState.editorError = inError;
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

export const setBlankTemplate: ActionResponse<{fork: string | null; language: string}> = (
  state,
  {fork, language},
) => {
  const newTemplate = JSON.parse(JSON.stringify(BLANK_TEMPLATE));
  newTemplate.code = JSON.stringify(EMPTY_SPEC_BY_LANGUAGE[language], null, 2);
  newTemplate.language = language;
  if (fork == 'output') {
    newTemplate.code = stringify(evaluateHydraProgram(state.currentTemplateInstance, state.templateMap));
  } else if (fork === 'body') {
    newTemplate.code = state.currentTemplateInstance.code;
  } else if (fork === 'all') {
    newTemplate.code = state.currentTemplateInstance.code;
    newTemplate.widgets = state.currentTemplateInstance.widgets;
  }
  return fillTemplateMapWithDefaults(
    produce(state, draftState => {
      draftState.currentTemplateInstance = newTemplate;
      draftState.encodingMode = BLANK_TEMPLATE.templateName;
      if (fork) {
        draftState.editMode = true;
        draftState.codeMode = TEMPLATE_BODY;
        draftState.showProgrammaticMode = true;
      }
    }),
  );
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

const topLevelKeys = new Set(['displayName', 'validations']);
export const setWidgetValue: ActionResponse<SetWidgetValuePayload> = (state, payload) => {
  const {key, value, idx} = payload;
  // const template = state.currentTemplateInstance;
  const code = state.currentTemplateInstance.code;
  return produce(state, draftState => {
    if (key === 'name') {
      // update the old code with the new name

      const widget = draftState.currentTemplateInstance.widgets[idx];
      const oldName = widget.name;
      /* eslint-disable @typescript-eslint/ban-ts-ignore*/
      // @ts-ignore
      const oldValue = `\\[${widget[key]}\\]`;
      /* eslint-enable @typescript-eslint/ban-ts-ignore*/
      const re = new RegExp(oldValue, 'g');
      draftState.currentTemplateInstance.code = code.replace(re, `[${value}]`);
      draftState.currentTemplateInstance.widgets[idx].name = value;

      // update the template map with the new name
      draftState.templateMap[value] = state.templateMap[oldName];
      delete draftState.templateMap[oldName];
    } else if (topLevelKeys.has(key)) {
      /* eslint-disable @typescript-eslint/ban-ts-ignore*/
      // @ts-ignore
      draftState.currentTemplateInstance.widgets[idx][key] = value;
      /* eslint-enable @typescript-eslint/ban-ts-ignore*/
    } else {
      /* eslint-disable @typescript-eslint/ban-ts-ignore*/
      // @ts-ignore
      draftState.currentTemplateInstance.widgets[idx].config[key] = value;
      /* eslint-enable @typescript-eslint/ban-ts-ignore*/
    }
  });
};

// hey it's a lense
type WidgetMod = (x: GenWidget[]) => GenWidget[];
const modifyCurrentWidgets = (state: AppState, mod: WidgetMod): AppState =>
  produce(state, draftState => {
    draftState.currentTemplateInstance.widgets = mod(state.currentTemplateInstance.widgets);
  });
export const addWidget: ActionResponse<Widget<any>> = (state, payload) =>
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
