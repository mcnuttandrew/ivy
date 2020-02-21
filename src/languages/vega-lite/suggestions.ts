import {setTemplateValues, generateFullTemplateMap} from '../../hydra-lang';
import {GenWidget, Suggestion} from '../../types';
import {widgetFactory} from '../../templates';
import {get, trim, union, difference, safeParse} from '../../utils';

// TODO i'd really like to just have one traverse function that i can add reduces to
function walkTreeAndLookForFields(keyPredicate: (key: any) => boolean) {
  return function walker(spec: any): Set<string> {
    // if it's array interate across it
    if (Array.isArray(spec)) {
      return spec.reduce((acc, child) => union(acc, walker(child)), new Set());
    }
    // if it's an object check
    if (typeof spec === 'object' && spec !== null) {
      // if not just treat it like a normal object
      return Object.entries(spec).reduce((acc: Set<string>, [key, value]: any) => {
        return union(keyPredicate(key) ? acc.add(value) : acc, walker(value));
      }, new Set());
    }
    // else just return
    return new Set();
  };
}

export function inferPossibleDataTargets(spec: any): Set<string> {
  const foundFields = walkTreeAndLookForFields((key: string) => key === 'field')(spec);
  const generatedFields = walkTreeAndLookForFields((key: string) => key === 'as')(spec);
  return difference(foundFields, generatedFields);
}

function inferRemoveDataSuggestions(code: string, parsedCode: any): Suggestion[] {
  const suggestions = [];
  // check to see if the values that are in the code are specifically defined
  const hasUrl = get(parsedCode, ['data', 'url']);
  const hasValues = get(parsedCode, ['data', 'values']);
  if (hasUrl || hasValues) {
    suggestions.push({
      from: 'data url',
      to: '"name": "myData"',
      comment: 'Remove Specific data',
      simpleReplace: false,
      codeEffect: (code: string) => {
        const parsed = JSON.parse(code);
        if (hasUrl) {
          delete parsed.data.url;
        }
        if (hasValues) {
          delete parsed.data.values;
        }
        parsed.data.name = 'myData';
        return JSON.stringify(parsed, null, 2);
      },
    });
  }
  if (Array.isArray(parsedCode.data) && parsedCode.data.find((d: any) => d.values)) {
    const idx = parsedCode.data.findIndex((d: any) => d.values);
    suggestions.push({
      from: 'data url',
      to: '"name": "myData"',
      comment: 'remove specific data',
      simpleReplace: false,
      codeEffect: (code: string) => {
        const parsed = JSON.parse(code);
        parsed.data[idx].values = 'myData';
        return JSON.stringify(parsed, null, 2);
      },
    });
  }
  return suggestions;
}

const targetTrim = (key: string): string => {
  let result = trim(key);
  if (key[0] === '[' && key[key.length - 1] === ']') {
    result = result.slice(1, key.length - 1);
  }
  return result;
};

const buildSuggest = (from: string, to: string): Suggestion => ({
  from: `"${from}"`,
  to: `"[${to}]"`,
  comment: `${from} -> ${to}`,
  simpleReplace: false,
});

function inferFieldTransformationSuggestions(
  code: string,
  parsedCode: any,
  widgets: GenWidget[],
): Suggestion[] {
  const widgetNames = widgets.reduce((acc, row) => acc.add(row.name).add(`[${row.name}]`), new Set());
  const possibleFields = Array.from(inferPossibleDataTargets(parsedCode));
  // if fields are use as a value they are likely being used like [FIELDNAME]": "[key]
  // ignore column names that are in there
  const likelyFields = possibleFields.filter(
    key =>
      (code.includes(`": "${key}`) || code.includes(`":"${key}`)) &&
      !widgetNames.has(key) &&
      !widgetNames.has(targetTrim(key)),
  );
  const dropTargets = widgets.filter(widget => widget.type === 'DataTarget').map(widget => widget.name);

  const suggestions = likelyFields.reduce((acc: Suggestion[], from) => {
    if (widgetNames.has(`[${from}]`)) {
      return acc;
    }
    // suggest setting the found field to all of the existing widgets
    dropTargets.forEach((to: string) => acc.push(buildSuggest(from, to)));

    // suggest creating a new widget

    const suggestedNewWidgetName = `Var${widgets.length + 1}`;
    acc.push({
      from: `"${from}"`,
      to: `"[${suggestedNewWidgetName}]"`,
      comment: `${from} -> ${suggestedNewWidgetName} (CREATE ${suggestedNewWidgetName})`,
      simpleReplace: false,
      sideEffect: () => widgetFactory.DataTarget(widgets.length + 1),
    });
    return acc;
  }, []);
  return suggestions;
}

/**
 * Given a code block and the collection of widgets, try to come up with suggestions to parameterize the code
 * @param code
 * @param widgets
 */
export function synthesizeSuggestions(code: string, widgets: GenWidget[]): Suggestion[] {
  // simulate a full template
  const simulatedCompleteTemplate = generateFullTemplateMap(widgets);
  const parsedCode = safeParse(setTemplateValues(code, simulatedCompleteTemplate));
  // if we can't, bail
  if (!parsedCode) {
    return [];
  }
  // start making suggestions
  const suggestions: Suggestion[] = [];
  const addSugesstion = (suggestion: Suggestion): any => suggestions.push(suggestion);
  inferFieldTransformationSuggestions(code, parsedCode, widgets).forEach(addSugesstion);
  inferRemoveDataSuggestions(code, parsedCode).forEach(addSugesstion);
  const dedup: Suggestion[] = Object.values(
    suggestions.reduce((acc, row) => ({...acc, [row.comment]: row}), {}),
  );

  return dedup;
}
