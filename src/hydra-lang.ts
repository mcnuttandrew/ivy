import {
  Template,
  TemplateMap,
  TemplateWidget,
  WidgetValidationQuery,
  DataTargetWidget,
  WidgetSubType,
  ListWidget,
  Shortcut,
  SwitchWidget,
  SliderWidget,
} from './templates/types';
import {trim} from './utils';

/**
 * Evaluate a hydra query, used for the widget validations and conditional checks
 * // TODO: this system doesn't support data type checking?
 * @param query - for now uses the special widget validation langugage
 * @param templateMap - the specification/variable values defined by the gui
 */
function evaluateQuery(query: WidgetValidationQuery, templateMap: TemplateMap): boolean {
  // TODO add a type check function to this
  const generatedContent = new Function('parameters', `return ${query}`);
  return Boolean(generatedContent(templateMap));
}

export function evaluateShortcut(shortcut: Shortcut, templateMap: TemplateMap): TemplateMap {
  const generatedContent = new Function('parameters', `return ${shortcut.shortcutFunction}`);
  const newMap = generatedContent(templateMap);
  return newMap;
}

interface ConditionalArgs {
  query: string;
  true: any;
  false: any;
  deleteKeyOnFalse?: boolean;
  deleteKeyOnTrue?: boolean;
}
function shouldUpdateContainerWithValue(
  queryResult: 'true' | 'false',
  conditional: ConditionalArgs,
): boolean {
  // if a conditional doesn't want that value to get added to the traversing object then ingnore it
  return (
    (queryResult === 'false' && conditional.deleteKeyOnFalse) ||
    (queryResult === 'true' && conditional.deleteKeyOnTrue)
  );
}

// syntax example
// {...example,
// mark: {
//   type: 'point',
//   tooltip: true,
//   color: {CONDITIONAL: {true: '[Single Color]', false: null, query: {Color: null}}},
// }}
/**
 * Walk across the tree and apply conditionals are appropriate,
 * example conditional syntax: {CONDITIONAL: {true: '[Single Color]', false: null, query: '!parameters.Color}}
 *
 * @param templateMap - the specification/variable values defined by the gui
 */
export function applyConditionals(templateMap: TemplateMap): any {
  return function walker(spec: any): any {
    // if it's array interate across it
    if (Array.isArray(spec)) {
      return spec.reduce((acc, child) => {
        if (child && typeof child === 'object' && child.CONDITIONAL) {
          const queryResult = evaluateQuery(child.CONDITIONAL.query, templateMap) ? 'true' : 'false';
          if (!shouldUpdateContainerWithValue(queryResult, child.CONDITIONAL)) {
            return acc.concat(walker(child.CONDITIONAL[queryResult]));
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
    if (typeof spec === 'object' && spec.CONDITIONAL) {
      const queryResult = evaluateQuery(spec.CONDITIONAL.query, templateMap) ? 'true' : 'false';
      if (!shouldUpdateContainerWithValue(queryResult, spec.CONDITIONAL)) {
        return walker(spec.CONDITIONAL[queryResult]);
      } else {
        return null;
      }
    }
    // otherwise looks through its children
    return Object.entries(spec).reduce((acc: any, [key, value]: any) => {
      // if it's a conditional, if so execute the conditional
      if (value && typeof value === 'object' && value.CONDITIONAL) {
        const queryResult = evaluateQuery(value.CONDITIONAL.query, templateMap) ? 'true' : 'false';
        if (!shouldUpdateContainerWithValue(queryResult, value.CONDITIONAL)) {
          acc[key] = walker(value.CONDITIONAL[queryResult]);
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
export function applyQueries(template: Template, templateMap: TemplateMap): TemplateWidget<any>[] {
  const widgetMap = template.widgets.reduce((acc: any, widget) => {
    acc[widget.widgetName] = true;
    return acc;
  }, {});

  const validWidgetNames = template.widgetValidations.reduce((acc: {[x: string]: boolean}, validation) => {
    const queryResult = evaluateQuery(validation.query, templateMap);
    acc[validation.queryTarget] = validation.queryResult === 'show' ? queryResult : !queryResult;
    return acc;
  }, widgetMap);
  return template.widgets.filter(widget => validWidgetNames[widget.widgetName]);
}

/**
 * Apply values from templatemap (specification) to template
 * Important to do it this way and not via json parse because values might be parts of strings
 * Example {"field": "datum.[VARIABLENAME]"}
 * @param code
 * @param templateMap - the specification/variable values defined by the gui
 */
export const setTemplateValues = (code: string, templateMap: TemplateMap): string => {
  const filledInSpec = Object.entries(templateMap).reduce((acc: string, keyValue: any) => {
    const [key, value] = keyValue;
    if (trim(value) !== value) {
      // this supports the weird HACK required to make the interpolateion system
      // not make everything a string
      return acc
        .replace(new RegExp(`"\\[${key}\\]"`, 'g'), value || 'null')
        .replace(new RegExp(`\\[${key}\\]`, 'g'), trim(value) || 'null');
    }
    const reg = new RegExp(`"\\[${key}\\]"`, 'g');
    return acc.replace(reg, (Array.isArray(value) && JSON.stringify(value)) || value || 'null');
  }, code);
  return filledInSpec;
};

/**
 * Generate a list of the missing fields on a template
 * @param template
 * @param templateMap - the specification/variable values defined by the gui
 */
export function getMissingFields(template: Template, templateMap: TemplateMap): string[] {
  const requiredFields = template.widgets
    .filter(d => d.widgetType === 'DataTarget' && (d as TemplateWidget<DataTargetWidget>).widget.required)
    .map(d => d.widgetName);
  const missingFileds = requiredFields
    .map((fieldName: string) => ({fieldName, value: !templateMap[fieldName]}))
    .filter((d: any) => d.value)
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

/**
 * for template map holes that are NOT data columns, fill em as best you can
 * @param template
 */
export function constructDefaultTemplateMap(template: Template): TemplateMap {
  return template.widgets.reduce((acc: any, w: TemplateWidget<WidgetSubType>) => {
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
}

/**
 *
 * @param template
 * @param templateMap - the specification/variable values defined by the gui
 */
export function evaluateHydraProgram(template: Template, templateMap: TemplateMap): any {
  // 1. apply variables to string representation of code
  const interpolatedVals = setTemplateValues(template.code, templateMap);
  // 2. parse to json
  // const parsedJson = JSON.parse(interpolatedVals);
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(interpolatedVals);
  } catch (e) {
    console.log(e, 'crash');
    parsedJson = {};
  }
  // 3. evaluate inline conditionals
  const evaluatableSpec = applyConditionals(templateMap)(parsedJson);
  // 4. return
  return evaluatableSpec;
}
