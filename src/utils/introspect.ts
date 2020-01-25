import {setTemplateValues} from '../hydra-lang';
import {TemplateWidget, WidgetSubType} from '../templates/types';
import {widgetFactory} from '../templates';
import {get} from '../utils';
import {generateFullTemplateMap, union, difference, buildSuggest, safeParse} from './introspec-utils';

export interface Suggestion {
  from: string;
  to: string;
  comment: string;
  sideEffect?: any;
  codeEffect?: (code: string) => string;
  simpleReplace: boolean;
}

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
  if (code.match(/"values": \[((.|\s|\S)+?)\]/)) {
    suggestions.push({
      from: code.match(/"values": \[((.|\s|\S)+?)\]/s)[0],
      to: '"name": "myData"',
      comment: 'remove specific data',
      simpleReplace: true,
    });
  }
  if (get(parsedCode, ['data', 'url'])) {
    suggestions.push({
      from: 'data url',
      to: '"name": "myData"',
      comment: 'remove specific data',
      simpleReplace: false,
      codeEffect: (code: string) => {
        const parsed = JSON.parse(code);
        delete parsed.data.url;
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

function inferFieldTransformationSuggestions(
  code: string,
  parsedCode: any,
  widgets: TemplateWidget<WidgetSubType>[],
): Suggestion[] {
  const widgetNames = widgets.reduce(
    (acc, row) => acc.add(row.widgetName).add(`[${row.widgetName}]`),
    new Set(),
  );
  const likelyFields = Array.from(inferPossibleDataTargets(parsedCode))
    // if fields are use as a value they are likely being used like [FIELDNAME]": "[key]
    // ignore column names that are in there
    .filter(key => (code.includes(`": "${key}`) || code.includes(`":"${key}`)) && !widgetNames.has(key));
  const dropTargets = widgets
    .filter(widget => widget.widgetType === 'DataTarget')
    .map(widget => widget.widgetName);

  const suggestions = likelyFields.reduce((acc: Suggestion[], from) => {
    // suggest setting the found field to all of the existing widgets
    dropTargets.forEach((to: string) => acc.push(buildSuggest(from, to)));

    // suggest creating a new widget

    const suggestedNewWidgetName = `Dim${widgets.length + 1}`;
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
export function synthesizeSuggestions(code: string, widgets: TemplateWidget<WidgetSubType>[]): Suggestion[] {
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

/**
 * Apply suggestion to code to generate updated code
 * @param code
 * @param suggestion
 */
export function takeSuggestion(code: string, suggestion: Suggestion): string {
  const {simpleReplace, from, to, codeEffect} = suggestion;
  if (codeEffect) {
    return codeEffect(code);
  }
  return simpleReplace ? code.replace(from, to) : code.replace(new RegExp(from, 'g'), to);
}
