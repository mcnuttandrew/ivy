import {
  Template,
  TemplateMap,
  TemplateWidget,
  WidgetValidationQuery,
  DataTargetWidget,
  WidgetSubType,
  ListWidget,
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
  // const code = template.code;
  // const scriptMatch = code.match(/<script>(.*)<\/script>/s);
  // const script = scriptMatch && scriptMatch.length ? scriptMatch[1] : '';
  // const outputMatch = code.match(/<output>(.*)<\/output>/s);
  // const output = outputMatch && outputMatch.length ? outputMatch[1].replace(/\n/g, '') : '{}';
  // const generatedContent = new Function('parameters', `${script}\n\n return ${output}`);
  // console.log(generatedContent(templateMap));
  // return generatedContent(templateMap);
  return Object.entries(query).every(([key, result]) => {
    if (result === null) {
      return typeof templateMap[key] !== 'number' && !templateMap[key];
    }
    if (result === '*') {
      return Boolean(templateMap[key]);
    }
    if (typeof result === 'string') {
      return templateMap[key] === result;
    }

    if (Array.isArray(result) && !Array.isArray(templateMap[key])) {
      return result.includes(templateMap[key] as string);
    }
    if (Array.isArray(result) && Array.isArray(templateMap[key])) {
      return JSON.stringify(result.sort()) === JSON.stringify((templateMap[key] as string[]).sort());
    }
    return false;
  });
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
 * example conditional syntax: {CONDITIONAL: {true: '[Single Color]', false: null, query: {Color: null}}}
 *
 * @param templateMap - the specification/variable values defined by the gui
 */
export function applyConditionals(templateMap: TemplateMap): any {
  return function walker(spec: any): any {
    // if it's array interate across it
    if (Array.isArray(spec)) {
      return spec.map(child => walker(child));
    }
    // check if it's an object
    if (typeof spec === 'object' && spec !== null) {
      return Object.entries(spec).reduce((acc: any, [key, value]: any) => {
        // if it's a conditional, if so execute the conditional
        if (value && typeof value === 'object' && value.CONDITIONAL) {
          const queryResult = evaluateQuery(value.CONDITIONAL.query, templateMap) ? 'true' : 'false';
          // this logic feels a little bit wonky, but i'd argue it's clear to list this explicitly
          if (queryResult === 'false' && value.CONDITIONAL.deleteKeyOnFalse) {
            // take no action in this case
          } else {
            acc[key] = walker(value.CONDITIONAL[queryResult]);
          }
        } else {
          acc[key] = walker(value);
        }
        return acc;
      }, {});
    }
    // else just return
    return spec;
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
  const parsedJson = JSON.parse(interpolatedVals);
  // 3. evaluate inline conditionals
  const evaluatableSpec = applyConditionals(templateMap)(parsedJson);
  // 4. return
  return evaluatableSpec;
}
