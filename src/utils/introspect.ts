import Immutable, {List} from 'immutable';
import {setTemplateValues} from '../reducers/template-actions';
import {
  TemplateWidget,
  widgetFactory,
  ListWidget,
  SwitchWidget,
  SliderWidget,
} from '../templates/types';

import {compile} from 'vega-lite';

// setting dimensions requires that dimension name be wrapped in a string
// here we strip them off so that the channel cencoding can find the correct value
function specialTrim(dimName: string) {
  if (!dimName || dimName.length < 3) {
    return dimName;
  }
  if (
    dimName.slice(0, 2) === '["' &&
    dimName.slice(dimName.length - 2) === '"]'
  ) {
    return dimName.slice(2, dimName.length - 2);
  }
  return dimName;
}

export function inferPossibleDataTargets(spec: any): string[] {
  if (spec.$schema === 'https://vega.github.io/schema/vega/v5.json') {
    return [];
  }

  // start with just vega-lite
  let vegaSpec: any = {};
  try {
    vegaSpec = compile(spec).spec;
  } catch (e) {
    console.log('compile error', e);
    vegaSpec = {};
  }
  const code = JSON.stringify(vegaSpec);
  if (code === '{}') {
    return [];
  }
  const transforms = vegaSpec.data.reduce((acc: any, dataSource: any) => {
    if (!dataSource.transform) {
      return acc;
    }
    dataSource.transform.forEach((transform: any) => {
      if (transform.groupby) {
        transform.groupby.forEach((key: string) => {
          acc[key] = true;
        });
        return;
      }

      const expr = transform.expr;
      if (!expr) {
        return acc;
      }
      (expr.match(/\["(.*?)"\]/g) || []).forEach((match: string) => {
        acc[match] = true;
      });
    });
    return acc;
  }, {});

  const inUseKeys = Object.keys(
    Object.keys(transforms)
      .filter((d: any) => d)
      .reduce((acc: any, row: string) => {
        acc[specialTrim(row)] = true;
        return acc;
      }, {}),
  );
  // match based on a hueristic
  const hueristicTargets =
    JSON.stringify(spec).match(/"field":\w*"(.*?)"/g) || [];
  Object.keys(
    hueristicTargets.reduce((acc: any, key: string) => {
      acc[key.slice(0, key.length - 1).slice('"field":"'.length)] = true;
      return acc;
    }, {}),
  ).forEach((key: string) => inUseKeys.push(key));
  return inUseKeys;
}

// https://www.rosettacode.org/wiki/Balanced_brackets#Iterative
function isBalanced(str: string) {
  // a very very dumb hack
  return (str.match(/\[/g) || []).length === (str.match(/\]/g) || []).length;
}
function safeParse(code: string) {
  let x = null;
  if (!isBalanced(code)) {
    return false;
  }
  try {
    x = JSON.parse(code);
  } catch (e) {
    x = false;
  }
  return x;
}

const DUMMY = 'xxxxxEXAMPLExxxx';
function generateFullTemplateMap(widgets: List<TemplateWidget>) {
  return widgets.reduce((acc: any, widget: TemplateWidget) => {
    const widgetType = widget.widgetType;
    if (widgetType === 'DataTarget') {
      acc[widget.widgetName] = `"${DUMMY}"`;
    }
    if (widgetType === 'MultiDataTarget') {
      acc[widget.widgetName] = `[${DUMMY}, ${DUMMY}]`;
    }
    if (widgetType === 'List') {
      acc[widget.widgetName] = (widget as ListWidget).defaultValue;
    }
    if (widgetType === 'Switch') {
      acc[widget.widgetName] = (widget as SwitchWidget).activeValue;
    }
    if (widgetType === 'Slider') {
      acc[widget.widgetName] = (widget as SliderWidget).defaultValue;
    }
    return acc;
  }, {});
}

export function synthesizeSuggestions(
  code: string,
  widgets: List<TemplateWidget>,
) {
  const parsedCode = safeParse(
    setTemplateValues(code, Immutable.fromJS(generateFullTemplateMap(widgets))),
  );
  if (!parsedCode) {
    return [];
  }
  const widgetNames = widgets.reduce(
    (acc: any, row: any) => ({
      ...acc,
      [row.widgetName]: true,
      [`[${row.widgetName}]`]: true,
    }),
    {},
  );

  const maybeTargets: string[] = inferPossibleDataTargets(parsedCode);
  const likelyFields = maybeTargets
    // if fields are use as a value they are likely being used like [FIELDNAME]": "[key]
    // ignore column names that are in there
    .filter(key => code.includes(`": "${key}`) && !widgetNames[key]);
  const dropTargets = widgets
    .filter(widget => widget.widgetType === 'DataTarget')
    .map(widget => widget.widgetName)
    .toJS();

  const suggestions = likelyFields.reduce((acc: any[], from) => {
    dropTargets.forEach((to: string) => {
      acc.push({
        from: `"${from}"`,
        to: `"[${to}]"`,
        comment: `${from} -> ${to}`,
      });
    });
    const to = `Dim${widgets.size + 1}`;
    acc.push({
      from: `"${from}"`,
      to: `"[${to}]"`,
      comment: `${from} -> ${to} (CREATE ${to})`,
      sideEffect: () => widgetFactory.DataTarget(widgets.size + 1),
    });
    return acc;
  }, []);
  // check to see if the values that are in the code are specifically defined
  if (code.match(/"values": \[((.|\s|\S)+?)\]/)) {
    suggestions.push({
      from: code.match(/"values": \[((.|\s|\S)+?)\]/s)[0],
      to: '"name": "myData"',
      comment: 'remove specific data',
      simpleReplace: true,
    });
  }
  // @ts-ignore
  const dedup = Object.values(
    suggestions.reduce((acc, row) => ({...acc, [row.comment]: row}), {}),
  );

  return dedup;
}

export function takeSuggestion(code: string, suggestion: any) {
  const {simpleReplace, from, to} = suggestion;
  return simpleReplace
    ? code.replace(from, to)
    : code.replace(new RegExp(from, 'g'), to);
}