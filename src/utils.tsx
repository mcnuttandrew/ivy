import stringify from 'json-stringify-pretty-compact';
import {
  TemplateWidget,
  Template,
  WidgetSubType,
  TemplateMap,
  DataTargetWidget,
  MultiDataTargetWidget,
} from './templates/types';
import {AppState} from './reducers/default-state';
import {NONE_TEMPLATE} from './constants/index';
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
  return tasks.reduce((promiseChain: any, task: any): any => promiseChain.then(task), Promise.resolve([]));
}

export function findField(state: AppState, targetField: string, columnKey = 'columns'): ColumnHeader {
  if (columnKey === 'metaColumns') {
    return state.metaColumns.find(({field}: {field: string}) => field === targetField);
  }
  return state.columns.find(({field}: {field: string}) => field === targetField);
}

// safely access elements on a nested object
export function get(obj: any, route: (string | number)[]): any {
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
  const encoding = (spec.spec && spec.spec.encoding) || spec.encoding || {};
  Object.values(encoding).forEach((x: any) => {
    if (!x) {
      return;
    }
    const channel = x;
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
  columns.filter((column: ColumnHeader) => column.type === type).map((column: ColumnHeader) => column.field);

export const getTemplate = (state: AppState, template: string): Template | null => {
  return state.templates.find((d: any) => d.templateName === template);
};

export function widgetInUse(code: string, widgetName: string): boolean {
  return Boolean(code.match(new RegExp(`\\[${widgetName}\\]`, 'g')));
}
export function allWidgetsInUse(code: string, widgets: TemplateWidget<WidgetSubType>[]): boolean {
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
  const template = base.currentTemplateInstance;
  // using the grammar mode
  if (!template) {
    return 'NA';
  }
  const associatedUpstreamTemplate = getTemplate(base, template.templateName);
  if (!associatedUpstreamTemplate) {
    return 'NOT FOUND';
  }
  return associatedUpstreamTemplate === template ? 'EQUAL' : 'DIFFERENT';
}

const USE_LOCAL = false;
export function serverPrefix(): string {
  return USE_LOCAL ? 'http://localhost:5000' : 'https://hydra-template-server.herokuapp.com';
}

export const computeValidAddNexts = (template: Template, templateMap: TemplateMap): Set<string> => {
  const dims = ['DIMENSION', 'MEASURE', 'METACOLUMN', 'TIME'];
  const dimCounter = dims.reduce((acc: any, key) => ({...acc, [key]: []}), {});

  const toSet = (counter: {[x: string]: any[]}): Set<string> =>
    new Set(
      Object.entries(counter)
        .filter(x => x[1].length)
        .map(x => x[0]),
    );

  if (!template) {
    dims.forEach(x => dimCounter[x].push(x));
    // don't do anything with T0 for now
    return toSet(dimCounter);
  }
  const result = template.widgets
    .filter(d => ['MultiDataTarget', 'DataTarget'].includes(d.widgetType))
    .reduce((acc: any, widget: any) => {
      const widgetType = widget.widgetType;
      const widgetName = widget.widgetName;
      const val = templateMap[widgetName];

      if (
        widgetType === 'MultiDataTarget' &&
        (!val || val.length < widget.widget.maxNumberOfTargets || !widget.widget.maxNumberOfTargets)
      ) {
        widget.widget.allowedTypes.forEach((allowedType: string): void => acc[allowedType].push(widgetName));
      }
      // dont try figure it out if it's in use, needs to be before multidatatarget which has a truthy null, []
      if (val) {
        return acc;
      }

      if (widgetType === 'DataTarget') {
        widget.widget.allowedTypes.forEach((allowedType: string): void => acc[allowedType].push(widgetName));
      }
      return acc;
    }, dimCounter);
  return toSet(result);
};

export const makeColNameMap = (columns: ColumnHeader[]): {[d: string]: ColumnHeader} =>
  columns.reduce((acc: {[d: string]: ColumnHeader}, colKey: ColumnHeader) => {
    acc[colKey.field] = colKey;
    return acc;
  }, {});

export function buildCounts(template: Template): any {
  let targetCount = 0;
  const counts = template.widgets.reduce(
    (acc: any, row: TemplateWidget<WidgetSubType>) => {
      if (row.widgetType === 'DataTarget') {
        targetCount += 1;
        const {allowedTypes} = row.widget as DataTargetWidget;
        allowedTypes.forEach((type: string) => {
          acc[type] += 1;
          if (allowedTypes.length > 1) {
            acc.mixingOn = acc.mixingOn.add(type);
          }
        });
      }
      if (row.widgetType === 'MultiDataTarget') {
        const {allowedTypes, maxNumberOfTargets} = row.widget as MultiDataTargetWidget;
        targetCount += maxNumberOfTargets || Infinity;
        allowedTypes.forEach((type: string) => {
          acc[type] += maxNumberOfTargets || Infinity;
          if (allowedTypes.length > 1) {
            acc.mixingOn = acc.mixingOn.add(type);
          }
        });
      }
      return acc;
    },
    {DIMENSION: 0, MEASURE: 0, TIME: 0, mixingOn: new Set()},
  );
  return {
    DIMENSION: `${counts.mixingOn.has('DIMENSION') ? '≤' : ''}${counts.DIMENSION}`,
    MEASURE: `${counts.mixingOn.has('MEASURE') ? '≤' : ''}${counts.MEASURE}`,
    TIME: `${counts.mixingOn.has('TIME') ? '≤' : ''}${counts.TIME}`,
    SUM: `${targetCount}`,
  };
}

export function searchDimensionsCanMatch(
  template: Template,
  templateMap: TemplateMap,
  columns: ColumnHeader[],
): {canBeUsed: boolean; isComplete: boolean} {
  const colMap = makeColNameMap(columns);
  const desiredColumns = (templateMap.dataTargetSearch as string[]).map(key => colMap[key]);
  const config = template.widgets;
  const targets = config.filter(d => d.widgetType === 'DataTarget') as TemplateWidget<DataTargetWidget>[];
  const multiTargets = config.filter(d => d.widgetType === 'MultiDataTarget') as TemplateWidget<
    MultiDataTargetWidget
  >[];
  const numRequired = targets.filter(d => d.widget.required).length;
  const usedTargets: Set<string> = new Set([]);
  const result = desiredColumns.every(col => {
    const availableSingleTargetField = targets
      .filter(d => !usedTargets.has(d.widgetName))
      .find(d => d.widget.allowedTypes.includes(col.type));
    const availableMultiTargetField = multiTargets.find(d => d.widget.allowedTypes.includes(col.type));

    if (availableSingleTargetField) {
      usedTargets.add(availableSingleTargetField.widgetName);
      return true;
    } else if (availableMultiTargetField) {
      return true;
    } else {
      return false;
    }
  });
  return {canBeUsed: result, isComplete: usedTargets.size >= numRequired};
}

// used for filtering out unsearched templates
export function searchPredicate(
  searchKey: string,
  templateName: string,
  templateDescription: string,
): boolean {
  const matchDescription = templateDescription && templateDescription.toLowerCase().includes(searchKey || '');
  const matchName = templateName && templateName.toLowerCase().includes(searchKey || '');
  return matchDescription || matchName;
}

export function sortObjectAlphabetically(obj: any): any {
  return Object.entries(obj)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((acc: any, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {});
}

export function getTemplateName(template: Template | null): string {
  if (!template) {
    return 'T0';
  }
  return template && template.templateName === NONE_TEMPLATE ? 'Template Gallery' : template.templateName;
}
