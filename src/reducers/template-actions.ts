import {get, set} from 'idb-keyval';
import produce from 'immer';
import {ActionResponse, AppState} from './default-state';
import {
  ListWidget,
  SliderWidget,
  SwitchWidget,
  Template,
  TemplateWidget,
  WidgetSubType,
} from '../templates/types';
import {BLANK_TEMPLATE} from '../templates';
import {setTemplateValues} from '../hydra-lang';
import {deserializeTemplate} from '../utils';

export function templateEval(state: AppState): AppState {
  // const filledInSpec = setTemplateValues(
  //   state.getIn(['currentTemplateInstance', 'code']),
  //   state.get('templateMap').toJS(),
  // );

  const filledInSpec = setTemplateValues(state.currentTemplateInstance.code, state.templateMap);
  return produce(state, draftState => {
    draftState.spec = JSON.parse(filledInSpec);
  });
}

// for template map holes that are NOT data columns, fill em as best you can
export function fillTemplateMapWithDefaults(state: AppState): AppState {
  const template = state.currentTemplateInstance;
  // const widgets =
  const filledInTemplateMap = template.widgets
    // .filter((widget: TemplateWidget<WidgetSubType>) => widget.widgetType !== 'DataTarget')
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
        value = localW.widget.defaultsToActive ? localW.widget.activeValue : localW.widget.inactiveValue;
      }
      if (w.widgetType === 'Slider') {
        value = (w as TemplateWidget<SliderWidget>).widget.defaultValue;
      }
      acc[w.widgetName] = value;
      return acc;
    }, {});

  return templateEval(
    produce(state, draftState => {
      draftState.templateMap = filledInTemplateMap;
    }),
  );
  // return templateEval(state.set('templateMap', filledInTemplateMap));
}

export const recieveTemplates: ActionResponse = (state, payload) => {
  return produce(state, draftState => {
    draftState.templates = payload;
  });
  // return state.set('templates', payload);
  // return setEncodingMode(state.set('templates', payload), '_____none_____');
};

export const setTemplateValue: ActionResponse = (state, payload) => {
  let newState = state;
  if (payload.containingShelf) {
    newState = produce(state, draftState => {
      delete draftState.templateMap[payload.containingShelf];
    });
    // newState = newState.deleteIn(['templateMap', payload.containingShelf]);
  }
  const template = state.currentTemplateInstance;
  return produce(newState, draftState => {
    draftState.templateMap[payload.field] = payload.text;
    draftState.spec = JSON.parse(setTemplateValues(template.code, draftState.templateMap));
  });
  // const template = state.get('currentTemplateInstance').toJS();
  // newState = newState.setIn(['templateMap', payload.field], payload.text);

  // const updatedTemplate = JSON.parse(setTemplateValues(template.code, n
  // return newState.set('spec', updatedTemplate);
};

// This function is poorly named, i don't know what it does
function getAndRemoveTemplate(state: AppState, templateName: string): AppState {
  return produce(state, draftState => {
    draftState.templates = state.templates.filter(
      (template: Template) => template.templateName !== templateName,
    );
  });
  // return state.get('templates').filter((template: Template) => template.templateName !== templateName);
}

const insertTemplateIntoTemplates: ActionResponse = (state, template) => {
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
  // const updatedState = state.set(
  //   'templates',
  //   getAndRemoveTemplate(state, template.templateName).concat(template),
  // );
  // // set current template to the newly created one
  // return updatedState;
};

export const saveCurrentTemplate: ActionResponse = state =>
  insertTemplateIntoTemplates(state, state.currentTemplateInstance);

export const loadExternalTemplate: ActionResponse = (state, payload) =>
  insertTemplateIntoTemplates(state, payload);

export const modifyValueOnTemplate: ActionResponse = (state, payload) => {
  const {value, key} = payload;
  console.log(value, key);
  return produce(state, draftState => {
    // draftState. =state.setIn(['currentTemplateInstance', key], value);
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
  // let newState = state.setIn(['currentTemplateInstance', key], value);
  // if (key === 'templateName') {
  //   newState = newState.set('encodingMode', value);
  // }
  // if (key === 'code') {
  //   newState = newState.set('editorError', payload.editorError);
  // }
  // return newState;
};

export const readInTemplate: ActionResponse = (state, payload) => {
  if (payload.error) {
    return produce(state, draftState => {
      draftState.editorError = payload.error;
    });
    // return state.set('editorError', payload.error);
  }
  return produce(state, draftState => {
    const updatedTemplate = deserializeTemplate(payload.code);
    updatedTemplate.code = state.currentTemplateInstance.code;
    draftState.currentTemplateInstance = updatedTemplate;
    draftState.editorError = payload.error;
  });
  // const updatedTemplate = deserializeTemplate(payload.code);
  // updatedTemplate.code = state.getIn(['currentTemplateInstance', 'code']);
  // return state.set('currentTemplateInstance', updatedTemplate).set('editorError', payload.error);
};

export const setBlankTemplate: ActionResponse = (state, fork) => {
  // const currentCode = state.getIn(['currentTemplateInstance', 'code']) || state.get('specCode');
  const currentCode = (state.currentTemplateInstance && state.currentTemplateInstance.code) || state.specCode;
  const newTemplate = JSON.parse(JSON.stringify(BLANK_TEMPLATE));
  if (fork) {
    // newTemplate = newTemplate.set('code', currentCode);
    newTemplate.code = currentCode;
  }
  return produce(state, draftState => {
    draftState.currentTemplateInstance = newTemplate;
    draftState.encodingMode = BLANK_TEMPLATE.templateName;
  });
  // return state.set('currentTemplateInstance', newTemplate).set('encodingMode', BLANK_TEMPLATE.templateName);
};

export const deleteTemplate: ActionResponse = (state, payload) => {
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
  // return state.set('templates', getAndRemoveTemplate(state, payload));
};

export const setWidgetValue: ActionResponse = (state, payload) => {
  const {key, value, idx} = payload;
  // let template = state.get('currentTemplateInstance');
  const template = state.currentTemplateInstance;
  const code = template.code;
  return produce(state, draftState => {
    draftState.currentTemplateInstance = produce(template, draftTemplate => {
      if (key === 'widgetName') {
        // update the old code with the new name
        const widget = draftTemplate.widgets[idx];
        /* eslint-disable @typescript-eslint/ban-ts-ignore*/
        // @ts-ignore
        const oldValue = `\\[${widget[key]}\\]`;
        /* eslint-enable @typescript-eslint/ban-ts-ignore*/
        const re = new RegExp(oldValue, 'g');
        draftTemplate.code = code.replace(re, `[${value}]`);
        draftState.templateMap[value] = state.templateMap[oldValue];
        delete draftState.templateMap[oldValue];
        draftTemplate.widgets[idx].widgetName = value;
      } else if (key === 'displayName') {
        // display name is a property of the widget container and not the widget parameter...
        draftTemplate.widgets[idx].displayName = value;
      } else {
        /* eslint-disable @typescript-eslint/ban-ts-ignore*/
        // @ts-ignore
        draftTemplate.widgets[idx].widget[key] = value;
        /* eslint-enable @typescript-eslint/ban-ts-ignore*/
      }
    });
  });
  // if (key === 'widgetName') {
  //   // TODO This is broken in the other branch
  //   // update the old code with the new name
  //   const oldValue = `\\[${template.widgets[idx][key]}\\]`;
  //   // const oldValue = `\\[${template.getIn(['widgets', idx, key])}\\]`;
  //   const re = new RegExp(oldValue, 'g');
  //   template = template.set('code', code.replace(re, `[${value}]`));
  //   newState = newState
  //     .deleteIn(['templateMap', oldValue])
  //     .setIn(['templateMap', value], state.getIn(['templateMap', oldValue]));

  //   // template = template.set('code', code.replace(re, `[${value}]`));
  //   // newState = newState
  //   //   .deleteIn(['templateMap', oldValue])
  //   //   .setIn(['templateMap', value], state.getIn(['templateMap', oldValue]));
  //     // change the variable
  //   template = template.setIn(['widgets', idx, key], value);
  // } else if (key === 'displayName') {
  //   // display name is a property of the widget container and not the widget parameter...
  //   template = template.setIn(['widgets', idx, key], value);
  // } else {
  //   template = template.setIn(['widgets', idx, 'widget', key], value);
  // }
  // return newState.set('currentTemplateInstance', template);
};

// hey it's a lense
type modifyWidgetLense = (
  state: AppState,
  mod: (x: TemplateWidget<WidgetSubType>[]) => TemplateWidget<WidgetSubType>[],
) => AppState;
const modifyCurrentWidgets: modifyWidgetLense = (state, mod) =>
  produce(state, draftState => {
    draftState.currentTemplateInstance.widgets = mod(state.currentTemplateInstance.widgets);
  });
export const addWidget: ActionResponse = (state, payload) =>
  modifyCurrentWidgets(state, d => d.concat(payload));
export const removeWidget: ActionResponse = (state, payload) =>
  modifyCurrentWidgets(state, d => d.filter((_: any, idx: number) => payload !== idx));

export const moveWidget: ActionResponse = (state, payload) => {
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
// const modifyCurrentWidgets: modifyWidgetLense = (state, mod) =>
//   state.setIn(
//     ['currentTemplateInstance', 'widgets'],
//     mod(state.getIn(['currentTemplateInstance', 'widgets'])),
//   );
// export const addWidget: ActionResponse = (state, payload) =>
//   modifyCurrentWidgets(state, d => d.push(payload));
// export const removeWidget: ActionResponse = (state, payload) =>
//   modifyCurrentWidgets(state, d => d.deleteIn([payload]));

// export const moveWidget: ActionResponse = (state, payload) => {
//   const {fromIdx, toIdx} = payload;
//   if (fromIdx === undefined || toIdx === undefined) {
//     return state;
//   }
//   return modifyCurrentWidgets(state, d => d.delete(fromIdx).insert(toIdx, d.get(fromIdx)));
// };
