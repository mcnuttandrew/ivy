import {
  Template,
  TemplateMap,
  TemplateWidget,
  WidgetValidationQuery,
  DataTargetWidget,
} from './templates/types';
import {trim} from './utils';

// TODO: this system doesn't support data type checking?
function evaluateQuery(query: WidgetValidationQuery, templateMap: TemplateMap): boolean {
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
export function applyConditionals(spec: any, templateMap: TemplateMap): any {
  // if it's array interate across it
  if (Array.isArray(spec)) {
    return spec.map(child => applyConditionals(child, templateMap));
  }
  // if it's an object check
  if (typeof spec === 'object' && spec !== null) {
    // if it's a conditional, if so execute the conditional
    if (spec.CONDITIONAL) {
      const queryResult = evaluateQuery(spec.CONDITIONAL.query, templateMap) ? 'true' : 'false';
      return applyConditionals(spec.CONDITIONAL[queryResult], templateMap);
    }
    // if not just treat it like a normal object
    return Object.entries(spec).reduce((acc: any, [key, value]: any) => {
      acc[key] = applyConditionals(value, templateMap);
      return acc;
    }, {});
  }
  // else just return
  return spec;
}

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

export function checkIfMapComplete(template: Template, templateMap: TemplateMap): boolean {
  const missing = getMissingFields(template, templateMap);
  return missing.length === 0;
}

export function evaluateHydraProgram(template: Template, templateMap: TemplateMap): any {
  // TODO maybe use this? https://neil.fraser.name/software/JS-Interpreter/
  const code = template.code;
  const scriptMatch = code.match(/<script>(.*)<\/script>/s);
  const script = scriptMatch && scriptMatch.length ? scriptMatch[1] : '';
  const outputMatch = code.match(/<output>(.*)<\/output>/s);
  const output = outputMatch && outputMatch.length ? outputMatch[1].replace(/\n/g, '') : '{}';
  const generatedContent = new Function('parameters', `${script}\n\n return ${output}`);
  console.log(generatedContent(templateMap));
  return generatedContent(templateMap);
}
