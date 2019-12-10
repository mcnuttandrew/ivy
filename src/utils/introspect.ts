import Immutable, {List} from 'immutable';
import {setTemplateValues} from '../reducers/template-actions';
import {
  TemplateWidget,
  widgetFactory,
  ListWidget,
  SwitchWidget,
  SliderWidget,
  DataTargetWidget,
} from '../templates/types';

import {parse, View} from 'vega';
import {
  compile,
  extractTransforms as vegaLiteExtractTransforms,
} from 'vega-lite';

// cache gets dumped across run times
// might br problematic for a larger system but fine here
// const vegaRenderingCache = {};
/**
 * generateVegaRendering, takes in a vega spec and returns a rendering of it
 */
export function generateVegaRendering(spec: any, language: string) {
  const config = {
    renderer: 'none',
  };
  return new Promise((resolve, reject) => {
    if (['vega-lite', 'vega'].indexOf(language)) {
      console.log('language not supported');
      return;
    }
    const vegaSpec = language === 'vega-lite' ? compile(spec).spec : spec;

    const runtime = parse(vegaSpec, {renderer: 'none'});
    const view = new View(runtime, config).initialize();
    view
      .runAsync()
      .then(x => {
        console.log(vegaSpec);
        console.log('middle introspect', view, compile(spec));
      })
      .catch(e => {
        /* eslint-disable no-console */
        console.error(e);
        reject(e);
        /* eslint-disable no-console */
      });
  });
}

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
  if (JSON.stringify(vegaSpec) === '{}') {
    return [];
  }
  const transforms = vegaSpec.data.reduce((acc: any, dataSource: any) => {
    if (!dataSource.transform) {
      return acc;
    }
    dataSource.transform.forEach((transform: any) => {
      console.log(transform);
      // @ts-ignore
      const expr = transform.expr;
      if (!expr) {
        return acc;
      }
      expr.match(/\["(.*?)"\]/g).forEach((match: string) => {
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
    console.log('eee', e);
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
): string[] {
  const parsedCode = safeParse(
    setTemplateValues(code, Immutable.fromJS(generateFullTemplateMap(widgets))),
  );
  if (!parsedCode) {
    return [];
  }

  const maybeTargets = inferPossibleDataTargets(parsedCode);
  // if fields are use as a value they are likely being used like [FIELDNAME]": "[key]
  const likelyFields = maybeTargets.filter((key: string) =>
    code.includes(`": "${key}`),
  );
  console.log(likelyFields);
  const dropTargets = widgets
    .filter(widget => widget.widgetType === 'DataTarget')
    .map(widget => widget.widgetName)
    .toJS();

  console.log(maybeTargets, dropTargets);
  const suggestions = likelyFields.reduce((acc: any[], from) => {
    dropTargets.forEach((to: string) => {
      acc.push({from, to: `[${to}]`, comment: `${from} -> ${to}`});
    });
    const to = `Dim${widgets.size + 1}`;
    acc.push({
      from,
      to: `[${to}]`,
      comment: `${from} -> ${to} (CREATE ${to})`,
      sideEffect: () => widgetFactory.DataTarget(widgets.size + 1),
    });
    return acc;
  }, []);
  return suggestions;
  // [{from: 'X', to: 'Y', sideEffect: () => {}}];
}
