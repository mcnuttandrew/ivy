import {
  ConditionQuery,
  DataTargetWidget,
  GenWidget,
  ListWidget,
  MultiDataTargetWidget,
  Shortcut,
  SliderWidget,
  SwitchWidget,
  Template,
  TemplateMap,
  Widget,
} from './types';
import {trim, get, log, logError} from './utils';
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
    log('Query Evalution Error', e, query, templateMap.paramValues);
  }
  return result;
}

export function evaluateShortcut(shortcut: Shortcut, templateMap: TemplateMap): TemplateMap {
  let newMap = templateMap;
  try {
    const generatedContent = new Function('parameters', `return ${shortcut.shortcutFunction}`);
    newMap = generatedContent(templateMap.paramValues);
  } catch (e) {
    log('Short cut error', e, shortcut.shortcutFunction, shortcut.label);
  }
  return newMap;
}

function shouldUpdateContainerWithValue(
  queryResult: 'true' | 'false',
  conditional: ConditionalArgs,
): boolean {
  // if a conditional doesn't want that value to get added to the traversing object then ingnore it
  return !Object.keys(conditional).includes(queryResult);
}

// syntax example
// {...example,
// mark: {
//   type: 'point',
//   tooltip: true,
//   color: {$cond: {true: '[Single Color]', false: null, query: {Color: null}}},
// }}
// TODO: a lot of the logic in this could be cleaned up into a pretty combinator pattern
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
      const reWith = new RegExp(`"\\[${key}\\]"`, 'g');
      const reWithout = new RegExp(`\\[${key}\\]`, 'g');
      if (trim(value) !== value) {
        // this supports the weird HACK required to make the interpolateion system
        // not make everything a string
        return acc.replace(reWith, value || 'null').replace(reWithout, trim(value) || 'null');
      }
      const setVal = (Array.isArray(value) && JSON.stringify(value)) || value || 'null';
      return acc.replace(reWith, setVal).replace(reWithout, setVal);
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
  const params = templateMap.paramValues;

  // data target
  const missingFileds = template.widgets
    .filter(d => d.type === 'DataTarget' && (d as Widget<DataTargetWidget>).config.required)
    .filter(d => !params[d.name])
    .map(d => d.name);

  // multi data target
  const missingMultiFileds = template.widgets
    .filter(d => d.type === 'MultiDataTarget' && (d as Widget<MultiDataTargetWidget>).config.required)
    .filter(
      (widget: Widget<MultiDataTargetWidget>) =>
        !params[widget.name] || params[widget.name].length < widget.config.minNumberOfTargets,
    )
    .map(d => d.name);
  return missingFileds.concat(missingMultiFileds);
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
    const config = (widget as Widget<ListWidget>).config;
    if (config.defaultValue) {
      return config.defaultValue;
    }
    const firstValue = config.allowedValues[0];
    if (!firstValue) {
      return null;
    }
    return typeof firstValue === 'string' ? firstValue : firstValue.value;
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
export function evaluateIvyProgram(template: Template, templateMap: TemplateMap): Json {
  // 1. apply variables to string representation of code
  const interpolatedVals = setTemplateValues(template.code, templateMap);
  // 2. parse to json
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(interpolatedVals);
  } catch (e) {
    logError('crash', e);
    logError('crashed on ', interpolatedVals);
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

/////////////////
///////////////// The following section is VERY cursed, be weary
/////////////////

const buildConditionalValidation = (type: any, defKey: string): any => {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      $cond: {
        description:
          'In conditional arguments, requires a query ( which is a js predicate), a true branch, and a false branch',
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Javascript predicate to be evaluated to determine result of predicate, must return a boolean. Some tips:\n\n 1. The current settings can be accessed by using the parameters object\n 2. The values held by values in the parameters object are strings.\n\n\n For example if you wanted to checked if boolean parameter setting was currently set to true, a reasonable way to do that would be:\n\n `parameters.switchVal === "true"` \n\n NOT `parameters.switchVal`\n\n The latter will always evaluated to true (because strings in JS are truthy).',
          },
          true: type ? {$ref: `#/${defKey}/${type}`} : {type: 'string'},
          false: type ? {$ref: `#/${defKey}/${type}`} : {type: 'string'},
        },
        required: ['query'],
      },
    },
  };
};
const buildInterpolantType = (old: any): any => {
  const escapeType = {type: 'string', pattern: '\\[.*\\]'};
  if (old.anyOf) {
    return {anyOf: [escapeType, ...old.anyOf]};
  } else if (old.type) {
    return {anyOf: [escapeType, {...old}]};
  } else {
    return escapeType;
  }
};

export function modifyJSONSchema(jsonSchema: any): any {
  const defKey = jsonSchema.$schema === 'http://json-schema.org/draft-06/schema#' ? 'defs' : 'definitions';
  const conditionalItem = {$ref: `#/${defKey}/IvyConditional`};

  function schemaWalk(spec: any): any {
    if (!spec) {
      return spec;
    }
    // if it's array interate across void
    if (Array.isArray(spec)) {
      return spec.map(child => schemaWalk(child));
    }
    // check if it's null or not an object return
    if (typeof spec !== 'object') {
      return spec;
    }

    if (spec.type && spec.type !== 'object' && typeof spec.type !== 'object') {
      const nodeClone = JSON.parse(JSON.stringify(spec));
      delete nodeClone.type;
      delete nodeClone.enum;
      const typeCopy: any = {type: spec.type};
      if (spec.enum) {
        typeCopy.enum = spec.enum;
      }
      nodeClone.anyOf = [conditionalItem, typeCopy, buildInterpolantType(spec)];
      return nodeClone;
    }
    if (spec.anyOf) {
      const nodeClone = JSON.parse(JSON.stringify(spec));
      nodeClone.anyOf = nodeClone.anyOf
        .filter((d: any) => d.type !== 'null')
        .map((d: any) => buildInterpolantType(d))
        .concat(nodeClone.anyOf);
      return nodeClone;
    }

    // otherwise looks through its children
    return Object.entries(spec).reduce((acc: any, [key, value]: any) => {
      acc[key] = schemaWalk(value);
      return acc;
    }, {});
  }
  const newSchema = schemaWalk(jsonSchema);
  newSchema[defKey] = Object.entries(newSchema[defKey]).reduce((acc: any, [key, value]: any) => {
    acc[`${key}-core-props`] = value;
    acc[key] = {
      anyOf: [
        {$ref: `#/${defKey}/${key}-core-props`},
        buildConditionalValidation(`${key}-core-props`, defKey),
      ],
    };
    return acc;
  }, {});
  newSchema[jsonSchema.$ref] = jsonSchema[jsonSchema.$ref];

  newSchema[defKey].IvyConditional = buildConditionalValidation(false, defKey);
  return newSchema;
}
