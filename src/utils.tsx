import stringify from 'json-stringify-pretty-compact';
import Immutable, {List} from 'immutable';
import {TemplateWidget, Template, WidgetSubType} from './templates/types';
import {AppState} from './reducers/default-state';
import {DataType, ColumnHeader} from './types';

/* eslint-disable @typescript-eslint/no-empty-function*/
export const NULL = (): void => {};
/* eslint-enable @typescript-eslint/no-empty-function*/

export function classnames(classObject: {[val: string]: boolean}): string {
  return Object.keys(classObject)
    .filter(name => classObject[name] && name)
    .join(' ');
}

export function getUniques(data: any, field: string): string[] {
  return Object.keys(
    data.reduce((acc: {[a: string]: boolean}, row: any) => {
      acc[row[field]] = true;
      return acc;
    }, {}),
  ).sort();
}

export function getDomain(data: any, field: string): number[] {
  type domainType = {min: number; max: number};
  return Object.values(
    data.reduce(
      (acc: domainType, row: any) => {
        return {
          min: Math.min(acc.min, row[field]),
          max: Math.max(acc.max, row[field]),
        };
      },
      {min: Infinity, max: -Infinity},
    ),
  );
}

export function executePromisesInSeries(tasks: any): any {
  return tasks.reduce(
    (promiseChain: any, task: any): any => promiseChain.then(task),
    Promise.resolve([]),
  );
}

export function findField(
  state: AppState,
  targetField: string,
  columnKey = 'columns',
): ColumnHeader {
  return state.get(columnKey).find(({field}: {field: string}) => field === targetField);
}

export function compareObjects(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const DEFAULT_CONFIG = {
  facet: {width: 150, height: 150},
  overlay: {line: true},
  scale: {useRawDomain: false},
};

export function cleanSpec(spec: any): any {
  if (spec.spec) {
    return {
      padding: 100,
      ...spec,
      spec: {
        config: DEFAULT_CONFIG,
        height: 300,
        width: 300,
        ...spec.spec,
      },
      data: {
        name: 'myData',
      },
    };
  }
  return {
    config: DEFAULT_CONFIG,
    padding: 50,
    ...spec,
    data: {
      name: 'myData',
    },
  };
  // return {
  //   config: DEFAULT_CONFIG,
  //   padding: 50,
  //   ...spec,
  //   encoding: {
  //     ...Object.entries(spec.encoding).reduce((acc: any, [key, val]: any) => {
  //       if (!compareObjects(val, {})) {
  //         acc[key] = val;
  //       }
  //       return acc;
  //     }, {}),
  //   },
  // };
}

// safely access elements on a nested object
export function get(obj: any, route: string[]): any {
  if (!obj) {
    return null;
  }
  if (route.length === 0) {
    return null;
  }
  if (route.length === 1) {
    return obj[route[0]];
  }
  const next = obj[route[0]];
  if (!next) {
    return null;
  }
  return get(next, route.slice(1));
}

export function getAllInUseFields(spec: any): Set<string> {
  // this only works for vega-lite
  const inUse = new Set([]);
  const encoding = spec.getIn(['spec', 'encoding']) || spec.getIn(['encoding']) || [];
  encoding.forEach((x: any) => {
    if (!x || !x.size) {
      return;
    }
    const channel = x.toJS();
    if (typeof channel.field === 'string') {
      inUse.add(channel.field);
      return;
    }
    if (channel.field && channel.field.repeat) {
      inUse.add(channel.field.repeat);
      return;
    }
  });
  return inUse;
}

export const extractFieldStringsForType = (columns: ColumnHeader[], type: DataType): string[] =>
  columns
    .filter((column: ColumnHeader) => column.type === type)
    .map((column: ColumnHeader) => column.field);

// currently unused
export function checkEncodingForValidity(spec: any): boolean {
  const usingNested = !!spec.spec;
  if (usingNested ? spec.spec.layer : spec.layer) {
    console.log('layer');
    return false;
  }
  if (usingNested ? !spec.spec.encoding : !spec.encoding) {
    console.log('encoding');
    return false;
  }
  return true;
}

export const getTemplate = (state: AppState, template: string): Template | null => {
  return state.get('templates').find((d: any) => d.templateName === template);
};

export function widgetInUse(code: string, widgetName: string): boolean {
  return Boolean(code.match(new RegExp(`\\[${widgetName}\\]`, 'g')));
}
export function allWidgetsInUse(
  code: string,
  widgets: List<TemplateWidget<WidgetSubType>>,
): boolean {
  return widgets
    .filter((widget: TemplateWidget<WidgetSubType>) => widget.widgetType !== 'Text')
    .every((widget: TemplateWidget<WidgetSubType>) => !!widgetInUse(code, widget.widgetName));
}

export const toSelectFormat = (arr: string[]): {value: string; label: string}[] =>
  arr.map((x: string) => ({value: x, label: x}));

// setting dimensions requires that dimension name be wrapped in a string
// here we strip them off so that the channel cencoding can find the correct value
export function trim(dimName: string): string {
  if (!dimName || dimName.length < 2) {
    return dimName;
  }
  if (dimName[0] === '"' && dimName[dimName.length - 1] === '"') {
    return dimName.slice(1, dimName.length - 1);
  }
  return dimName;
}

export const toList = (list: string[]): {display: string; value: string}[] =>
  list.map(display => ({
    display,
    value: `"${display}"`,
  }));

export function serializeTemplate(template: Template): string {
  return stringify({
    $schema: 'https://kind-goldwasser-f3ce26.netlify.com/assets/hydra-template.json',
    templateName: template.templateName,
    templateDescription: template.templateDescription,
    code: 'SEE CODE EDITOR',
    templateLanguage: template.templateLanguage,
    widgets: template.widgets,
    widgetValidations: template.widgetValidations,
  });
}

export function deserializeTemplate(templateString: string): Template {
  const code = JSON.parse(templateString);
  return {
    templateName: code.templateName,
    templateDescription: code.templateDescription,
    code: 'SEE CODE EDITOR',
    templateLanguage: code.templateLanguage,
    widgets: code.widgets,
    widgetValidations: code.widgetValidations,
  };
}

type SaveState = 'NA' | 'NOT FOUND' | 'EQUAL' | 'DIFFERENT';
export function getTemplateSaveState(base: AppState): SaveState {
  const template = base.get('currentTemplateInstance');
  // using the grammar mode
  if (!template) {
    return 'NA';
  }
  const associatedUpstreamTemplate = getTemplate(base, template.get('templateName'));
  if (!associatedUpstreamTemplate) {
    return 'NOT FOUND';
  }
  return Immutable.fromJS(associatedUpstreamTemplate).equals(template) ? 'EQUAL' : 'DIFFERENT';
}
