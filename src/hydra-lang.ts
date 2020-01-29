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
  // TODO add a type check function to this
  const generatedContent = new Function('parameters', `return ${query}`);
  return Boolean(generatedContent(templateMap));
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
      return spec.map(child => walker(child));
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

const buildConditionalValidation = (type: any, desc?: string): any => ({
  description: desc ? desc : 'HYDRA CONDITIONAL',
  type: 'object',
  additionalProperties: false,
  properties: {
    CONDITIONAL: {
      description:
        'In conditional arguments, requires a query ( which is a js predicate), a true branch, and a false branch',
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'javascript predicate to be evaluated to determine result of predicate. must return a boolean',
        },
        true: type
          ? {
              $ref: `#/definitions/${type}`,
              description: 'the result is swapped in',
            }
          : {type: 'string', description: 'unsure what type was supposed to be, assuming string'},
        false: type
          ? {
              $ref: `#/definitions/${type}`,
              description: 'the result is swapped in',
            }
          : {type: 'string', description: 'unsure what type was supposed to be, assuming string'},
        //   false: {
        //   // type: 'string',
        //   $ref: `#/definitions/${type}`,
        //   description: 'the result is swapped in',
        // },
        deleteKeyOnFalse: {
          type: 'boolean',
          description: 'delete the parent key if the query resturns false. MORE EXPLANATION',
        },
        deleteKeyOnTrue: {
          type: 'boolean',
          description: 'delete the parent key if the query resturns false. MORE EXPLANATION',
        },
      },
      required: ['query', 'true', 'false'],
    },
    // required: ['CONDITIONAL'],
  },
});
const buildInterpolantType = (old: any): any => ({
  description: old.description
    ? `Hydra reinterpolation for value. Normal type is: ${old.description}`
    : 'interpolate a new value wowzee',
  type: 'string',
  pattern: '\\[.*\\]',
});
export function modifyJSONSchema(jsonSchema: any): any {
  // add [string] to all enums?
  // https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions

  // // add CONDITIONAL to all anyOf
  const conditionalItem = {$ref: '#/definitions/HydraConditional'};

  function schemaWalk(spec: any): any {
    if (!spec) {
      return spec;
    }
    // console.log(spec);
    // if it's array interate across void
    if (Array.isArray(spec)) {
      return spec.map(child => schemaWalk(child));
    }
    // check if it's null or not an object return
    if (typeof spec !== 'object') {
      return spec;
    }
    // if (!(typeof spec === 'object' && spec !== null)) {
    //   return spec;
    // }
    if (spec.type && spec.type !== 'object' && typeof spec.type !== 'object') {
      const nodeClone = JSON.parse(JSON.stringify(spec));
      delete nodeClone.type;
      delete nodeClone.enum;
      const typeCopy: any = {type: spec.type};
      if (spec.enum) {
        typeCopy.enum = spec.enum;
      }
      nodeClone.anyOf = [
        buildInterpolantType(spec),
        conditionalItem,
        typeCopy,
        //
      ];
      return nodeClone;
    }
    if (spec.type && typeof spec.type === 'object' && !Array.isArray(spec.type)) {
      const nodeClone = JSON.parse(JSON.stringify(spec));
      nodeClone.type = {...spec.type, anyOf: [buildInterpolantType(spec.type), {$ref: spec.type.$ref}]};
      delete nodeClone.type.$ref;
      return nodeClone;
    }
    if (spec.anyOf) {
      const nodeClone = JSON.parse(JSON.stringify(spec));
      nodeClone.anyOf = [
        buildInterpolantType(spec),
        //
        conditionalItem,
      ].concat(nodeClone.anyOf);
      return nodeClone;
    }

    // otherwise looks through its children
    return Object.entries(spec).reduce((acc: any, [key, value]: any) => {
      // actually i don't think this is necessary if the validation is recursive
      // if (key === '$ref' && !value.includes('-core-props')) {
      //   console.log(key, value);
      //   acc[key] = `${value}-core-props`;
      //   return acc;
      // }
      acc[key] = schemaWalk(value);
      return acc;
    }, {});
  }
  const newSchema = schemaWalk(jsonSchema);
  newSchema.definitions = Object.entries(newSchema.definitions).reduce((acc: any, [key, value]: any) => {
    acc[`${key}-core-props`] = value;
    acc[key] = {
      anyOf: [
        {$ref: `#/definitions/${key}-core-props`},
        buildConditionalValidation(`${key}-core-props`, value.description),
      ],
    };
    return acc;
  }, {});
  newSchema[jsonSchema.$ref] = jsonSchema[jsonSchema.$ref];

  newSchema.definitions.HydraConditional = buildConditionalValidation(false);
  // newSchema.definitions.HydraConditionalProps = CONDITIONAL_PROPS_DEF;
  return newSchema;
}
