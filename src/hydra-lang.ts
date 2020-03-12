import {
  Template,
  TemplateMap,
  Widget,
  ConditionQuery,
  DataTargetWidget,
  GenWidget,
  ListWidget,
  Shortcut,
  SwitchWidget,
  SliderWidget,
} from './types';
import {trim, get} from './utils';
import {JsonMap, Json, JsonArray} from './types';

interface ConditionalArgs {
  query: string;
  true?: Json;
  false?: Json;
}
export type IvyLangConditional = {$cond: ConditionalArgs};

/**
 * Evaluate a ivy query, used for the widget conditions and conditional checks
 * // TODO: this system doesn't support data type checking?
 * @param query - for now uses the special widget condition langugage
 * @param templateMap - the specification/variable values defined by the gui
 */
function evaluateQuery(query: ConditionQuery, templateMap: TemplateMap): boolean {
  // TODO add a type check function to this
  // TODO can probable keep a cache of these results?
  let result = false;
  try {
    const generatedContent = new Function('parameters', `return ${query}`);
    result = Boolean(generatedContent(templateMap.paramValues));
  } catch (e) {
    console.log('Query Evalu Error', e, query);
  }
  return result;
}

export function evaluateShortcut(shortcut: Shortcut, templateMap: TemplateMap): TemplateMap {
  let newMap = templateMap;
  try {
    const generatedContent = new Function('parameters', `return ${shortcut.shortcutFunction}`);
    newMap = generatedContent(templateMap.paramValues);
  } catch (e) {
    console.log('Short cut error', e, shortcut.shortcutFunction, shortcut.label);
  }
  return newMap;
}

function shouldUpdateContainerWithValue(
  queryResult: 'true' | 'false',
  conditional: ConditionalArgs,
): boolean {
  // if a conditional doesn't want that value to get added to the traversing object then ingnore it
  return (
    (queryResult === 'false' && !conditional[queryResult]) ||
    (queryResult === 'true' && !conditional[queryResult])
  );
}

// syntax example
// {...example,
// mark: {
//   type: 'point',
//   tooltip: true,
//   color: {$cond: {true: '[Single Color]', false: null, query: {Color: null}}},
// }}
/**
 * Walk across the tree and apply conditionals are appropriate,
 * example conditional syntax: {$cond: {true: '[Single Color]', false: null, query: '!parameters.Color}}
 *
 * @param templateMap - the specification/variable values defined by the gui
 * @returns JSON (any is the dumb stand in for json)
 */
export function applyConditionals(templateMap: TemplateMap): (spec: Json) => Json {
  return function walker(spec: Json): Json {
    // if it's array interate across it
    if (Array.isArray(spec)) {
      return spec.reduce((acc: JsonArray, child) => {
        if (child && typeof child === 'object' && (child as JsonMap).$cond) {
          const valuemap = (child as unknown) as IvyLangConditional;
          const queryResult = evaluateQuery(valuemap.$cond.query, templateMap) ? 'true' : 'false';
          if (!shouldUpdateContainerWithValue(queryResult, valuemap.$cond)) {
            return acc.concat(walker(valuemap.$cond[queryResult]));
          } else {
            return acc;
          }
        }
        return acc.concat(walker(child));
      }, []);
    }
    // check if it's null or not an object return
    if (!(typeof spec === 'object' && spec !== null)) {
      return spec;
    }
    // if the object being consider is itself a conditional evaluate it
    if (typeof spec === 'object' && spec.$cond) {
      const valuemap = (spec as unknown) as IvyLangConditional;
      const queryResult = evaluateQuery(valuemap.$cond.query, templateMap) ? 'true' : 'false';
      if (!shouldUpdateContainerWithValue(queryResult, valuemap.$cond)) {
        return walker(valuemap.$cond[queryResult]);
      } else {
        return null;
      }
    }
    // otherwise looks through its children
    return Object.entries(spec).reduce((acc: JsonMap, [key, value]: [string, Json]) => {
      // if it's a conditional, if so execute the conditional
      if (value && typeof value === 'object' && (value as JsonMap).$cond) {
        const valuemap = (value as unknown) as IvyLangConditional;
        const queryResult = evaluateQuery(valuemap.$cond.query, templateMap) ? 'true' : 'false';
        if (!shouldUpdateContainerWithValue(queryResult, valuemap.$cond)) {
          acc[key] = walker(valuemap.$cond[queryResult]);
        }
      } else {
        acc[key] = walker(value);
      }
      return acc;
    }, {});
  };
}

/**
 *
 * @param template
 * @param templateMap - the specification/variable values defined by the gui
 */
export function applyQueries(template: Template, templateMap: TemplateMap): Widget<any>[] {
  return template.widgets.filter(widget => {
    if (!widget.conditions || !widget.conditions.length) {
      return true;
    }
    return widget.conditions.every(condition => {
      const queryResult = evaluateQuery(condition.query, templateMap);
      return condition.queryResult === 'show' ? queryResult : !queryResult;
    });
  });
}

/**
 * Apply values from templatemap (specification) to template
 * Important to do it this way and not via json parse because values might be parts of strings
 * Example {"field": "datum.[VARIABLENAME]"}
 * @param code
 * @param templateMap - the specification/variable values defined by the gui
 */
export const setTemplateValues = (code: string, templateMap: TemplateMap): string => {
  const filledInSpec = Object.entries(templateMap.paramValues).reduce(
    (acc: string, [key, value]: [string, string | null]) => {
      if (trim(value) !== value) {
        // this supports the weird HACK required to make the interpolateion system
        // not make everything a string
        return acc
          .replace(new RegExp(`"\\[${key}\\]"`, 'g'), value || 'null')
          .replace(new RegExp(`\\[${key}\\]`, 'g'), trim(value) || 'null');
      }
      const reg = new RegExp(`"\\[${key}\\]"`, 'g');
      return acc.replace(reg, (Array.isArray(value) && JSON.stringify(value)) || value || 'null');
    },
    code,
  );
  return filledInSpec;
};

/**
 * Generate a list of the missing fields on a template
 * @param template
 * @param templateMap - the specification/variable values defined by the gui
 */
export function getMissingFields(template: Template, templateMap: TemplateMap): string[] {
  const requiredFields = template.widgets
    .filter(d => d.type === 'DataTarget' && (d as Widget<DataTargetWidget>).config.required)
    .map(d => d.name);
  const missingFileds = requiredFields
    .map((fieldName: string) => ({fieldName, value: !templateMap.paramValues[fieldName]}))
    .filter(d => d.value)
    .map(d => d.fieldName);

  return missingFileds;
}

/**
 * Figure out if the all of the required fields have been filled in
 * @param template
 * @param templateMap - the specification/variable values defined by the gui
 */
export function checkIfMapComplete(template: Template, templateMap: TemplateMap): boolean {
  const missing = getMissingFields(template, templateMap);
  return missing.length === 0;
}

export function getDefaultValueForWidget(widget: GenWidget): any {
  if (widget.type === 'MultiDataTarget') {
    return [];
  }
  if (widget.type === 'Text' || widget.type === 'Section') {
    return null;
  }
  if (widget.type === 'List') {
    const localW = widget as Widget<ListWidget>;
    return localW.config.defaultValue || get(localW, ['config', 'allowedValues', 0, 'value']);
  }
  if (widget.type === 'Switch') {
    const localW = widget as Widget<SwitchWidget>;
    return localW.config.defaultsToActive ? localW.config.active : localW.config.inactive;
  }
  if (widget.type === 'Slider') {
    return (widget as Widget<SliderWidget>).config.defaultValue;
  }
  if (widget.type === 'FreeText') {
    return '';
  }
  return null;
}
const MARK_UP_COMPONENTS = new Set(['Text', 'Section']);

/**
 * for template map holes that are NOT data columns, fill em as best you can
 * @param template
 */
export function constructDefaultTemplateMap(template: Template): TemplateMap {
  const paramValues = template.widgets.reduce((acc: any, widget: GenWidget) => {
    if (MARK_UP_COMPONENTS.has(widget.type)) {
      return acc;
    }
    acc[widget.name] = getDefaultValueForWidget(widget);
    return acc;
  }, {});

  return {paramValues, systemValues: {viewsToMaterialize: {}, dataTransforms: []}};
}

/**
 *
 * @param template
 * @param templateMap - the specification/variable values defined by the gui
 */
export function evaluateHydraProgram(template: Template, templateMap: TemplateMap): Json {
  // 1. apply variables to string representation of code
  const interpolatedVals = setTemplateValues(template.code, templateMap);
  // 2. parse to json
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(interpolatedVals);
  } catch (e) {
    console.error('crash', e);
    console.error('crashed on ', interpolatedVals);
    parsedJson = {};
  }
  // 3. evaluate inline conditionals
  const evaluatableSpec = applyConditionals(templateMap)(parsedJson);
  // 4. return
  return evaluatableSpec;
}

const DUMMY = 'xxxxxEXAMPLExxxx';
export function generateFullTemplateMap(widgets: GenWidget[]): TemplateMap {
  const paramValues = widgets.reduce((acc: {[x: string]: any}, widget: GenWidget) => {
    const widgetType = widget.type;
    if (widgetType === 'DataTarget') {
      acc[widget.name] = `"${DUMMY}"`;
    }
    if (widgetType === 'MultiDataTarget') {
      acc[widget.name] = `[${DUMMY}, ${DUMMY}]`;
    }
    if (widgetType === 'List') {
      const localW = widget as Widget<ListWidget>;
      acc[widget.name] = localW.config.defaultValue || get(localW, ['config', 'allowedValues', 0, 'value']);
    }
    if (widgetType === 'Switch') {
      const localW = widget as Widget<SwitchWidget>;
      acc[widget.name] = localW.config.active;
    }
    if (widgetType === 'Slider') {
      const localW = widget as Widget<SliderWidget>;
      acc[widget.name] = localW.config.defaultValue;
    }
    return acc;
  }, {});

  return {
    paramValues,
    systemValues: {viewsToMaterialize: {}, dataTransforms: []},
  };
}

// type InterpolantEffect<T> = {predicate: (x: T) => boolean; effect: (x: T) => Json};
// interface JsonInterpolatorProps {
//   leafEffects: InterpolantEffect<Json>[];
//   arrayEffect: InterpolantEffect<Json>[];
//   objectEffects: InterpolantEffect<[string, Json]>[];
// }
// function jsonInterpolator(props: JsonInterpolatorProps): (spec: Json) => Json {
//   const {leafEffects, arrayEffect, objectEffects} = props;
//   return function walker(spec: Json): Json {
//     // effect for particular predicates
//     for (let i = 0; i < leafEffects.length; i++) {
//       const {predicate, effect} = leafEffects[i];
//       if (predicate(spec)) {
//         return effect(spec);
//       }
//     }

//     // if it's array interate across it
//     if (Array.isArray(spec)) {
//       return spec.reduce((acc: JsonArray, child) => {
//         // effect for array members
//         for (let i = 0; i < arrayEffect.length; i++) {
//           const {predicate, effect} = arrayEffect[i];
//           if (predicate(child)) {
//             return effect(child);
//           }
//         }
//         return acc.concat(walker(child));
//       }, []);
//     }
//     // check if it's null or not an object return
//     if (!(typeof spec === 'object' && spec !== null)) {
//       // Leaf effects
//       return spec;
//     }

//     // otherwise looks through its children
//     return Object.entries(spec).reduce((acc: JsonMap, [key, value]: [string, Json]) => {
//       // effect for objects
//       for (let i = 0; i < objectEffects.length; i++) {
//         const {predicate, effect} = objectEffects[i];
//         if (predicate([key, value])) {
//           acc[key] = effect([key, value]);
//           return;
//         }
//       }
//       acc[key] = walker(value);
//       return acc;
//     }, {});
//   };
// }

// /**
//  *
//  * @param template
//  * @param templateMap - the specification/variable values defined by the gui
//  */
// export function backpropHydraProgram(
//   template: Template,
//   templateMap: TemplateMap,
//   newoutput: string,
// ): {template: Template; templateMap: TemplateMap} {
//   // recursively walk from the top node forward, if that node is different in the new output then change it
//   let parsedJson = null;
//   try {
//     parsedJson = JSON.parse(newoutput);
//   } catch (e) {
//     return {template, templateMap};
//   }

//   // recursively walk from the top node forward, if that node is different in the new output then change it
//   return {template, templateMap};
// }
