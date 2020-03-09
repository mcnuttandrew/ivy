import {setTemplateValues, generateFullTemplateMap} from '../hydra-lang';
import {GenWidget, Suggestion, ColumnHeader} from '../types';
import {DataTargetFactory} from '../templates';
import {trim} from '../utils';

/**
 *
 * @param key which might have brackets around it
 * @returns a string without []
 */
export const targetTrim = (key: string): string => {
  let result = trim(key);
  if (key[0] === '[' && key[key.length - 1] === ']') {
    result = result.slice(1, key.length - 1);
  }
  return result;
};

export const buildSuggest = (from: string, to: string): Suggestion => ({
  from: `"${from}"`,
  to: `"[${to}]"`,
  comment: `${from} -> ${to}`,
  simpleReplace: false,
});

export function safeParse(code: string): string | boolean {
  let x = null;
  try {
    x = JSON.parse(code);
  } catch (e) {
    x = false;
  }
  return x;
}

export function union(setA: Set<any>, setB: Set<any>): Set<any> {
  const _union = new Set(setA);
  for (const elem of setB) {
    _union.add(elem);
  }
  return _union;
}
export function difference(setA: Set<any>, setB: Set<any>): Set<any> {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

// TODO i'd really like to just have one traverse function that i can add reduces to
export function walkTreeAndLookForFields(keyPredicate: (key: any) => boolean) {
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

function inferFieldTransformationSuggestions(
  code: string,
  parsedCode: any,
  widgets: GenWidget[],
  inferenceFunction: (spec: any) => Set<string>,
  columns: ColumnHeader[],
): Suggestion[] {
  const widgetNames = widgets.reduce((acc, row) => acc.add(row.name).add(`[${row.name}]`), new Set());
  const possibleFields = Array.from(inferenceFunction(parsedCode));
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
    const fieldPresentInData = columns.find(col => col.field === from);
    // suggest setting the found field to all of the existing widgets
    dropTargets.forEach((to: string) => acc.push(buildSuggest(from, to)));

    // suggest creating a new widget

    const suggestedNewWidgetName = `Var${widgets.length + 1}`;
    acc.push({
      from: `"${from}"`,
      to: `"[${suggestedNewWidgetName}]"`,
      comment: `${from} -> ${suggestedNewWidgetName} (CREATE ${suggestedNewWidgetName})`,
      simpleReplace: false,
      sideEffect: () => DataTargetFactory(widgets.length + 1),
    });
    if (fieldPresentInData) {
      acc.push({
        from: `"${from}"`,
        to: `"[${suggestedNewWidgetName}]"`,
        comment: `${from} -> ${suggestedNewWidgetName} (CREATE/UPDATE ${suggestedNewWidgetName})`,
        simpleReplace: false,
        sideEffect: setTemplateValues => {
          setTemplateValues({
            paramValues: {[suggestedNewWidgetName]: `"${from}"`},
            systemValues: {viewsToMaterialize: {}, dataTransforms: []},
          });
          return DataTargetFactory(widgets.length + 1);
        },
      });
    }
    return acc;
  }, []);
  return suggestions;
}

export function buildSynthesizer(
  inferenceFunction: (spec: string) => Set<string>,
  localDataSuggestions: (code: string, parsedCode: any) => Suggestion[],
) {
  /**
   * Given a code block and the collection of widgets, try to come up with suggestions to parameterize the code
   * @param code
   * @param widgets
   */
  return function synthesizeSuggestions(
    code: string,
    widgets: GenWidget[],
    columns: ColumnHeader[],
  ): Suggestion[] {
    // simulate a full template
    const simulatedCompleteTemplate = generateFullTemplateMap(widgets);
    const parsedCode = safeParse(setTemplateValues(code, simulatedCompleteTemplate));
    // if we can't, bail
    if (!parsedCode) {
      return [];
    }
    // start making suggestions
    const suggestions: Suggestion[] = [];
    const addSuggestion = (suggestion: Suggestion): any => suggestions.push(suggestion);
    inferFieldTransformationSuggestions(code, parsedCode, widgets, inferenceFunction, columns).forEach(
      addSuggestion,
    );
    localDataSuggestions(code, parsedCode).forEach(addSuggestion);
    const dedup: Suggestion[] = Object.values(
      suggestions.reduce((acc, row) => ({...acc, [row.comment]: row}), {}),
    );

    return dedup;
  };
}
