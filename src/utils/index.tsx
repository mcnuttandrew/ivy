import stringify from 'json-stringify-pretty-compact';
import {
  DataTargetWidget,
  DataType,
  MultiDataTargetWidget,
  Template,
  TemplateMap,
  TemplateWidget,
  WidgetSubType,
} from '../templates/types';
import {AppState} from '../reducers/default-state';
import {TEXT_TYPE} from '../constants/index';
import NONE from '../templates/example-templates/none';
import {ColumnHeader} from '../types';

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

export function widgetInUse(code: string, name: string): boolean {
  return Boolean(code.match(new RegExp(`\\[${name}\\]`, 'g')));
}
export function allWidgetsInUse(code: string, widgets: TemplateWidget<WidgetSubType>[]): boolean {
  return widgets
    .filter((widget: TemplateWidget<WidgetSubType>) => widget.type !== 'Text')
    .every((widget: TemplateWidget<WidgetSubType>) => !!widgetInUse(code, widget.name));
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
    templateAuthor: template.templateAuthor,
    code: 'SEE BODY',
    templateLanguage: template.templateLanguage,
    widgets: template.widgets,
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
    templateAuthor: code.templateAuthor,
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
    .filter(d => ['MultiDataTarget', 'DataTarget'].includes(d.type))
    .reduce((acc: any, widget: any) => {
      const type = widget.type;
      const name = widget.name;
      const val = templateMap[name];

      if (
        type === 'MultiDataTarget' &&
        (!val || val.length < widget.config.maxNumberOfTargets || !widget.config.maxNumberOfTargets)
      ) {
        widget.config.allowedTypes.forEach((allowedType: string): void => acc[allowedType].push(name));
      }
      // dont try figure it out if it's in use, needs to be before multidatatarget which has a truthy null, []
      if (val) {
        return acc;
      }

      if (type === 'DataTarget') {
        widget.config.allowedTypes.forEach((allowedType: string): void => acc[allowedType].push(name));
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
  let SUM = 0;
  const counts = template.widgets.reduce(
    (acc: any, row: TemplateWidget<WidgetSubType>) => {
      if (row.type === 'DataTarget') {
        const {allowedTypes, required} = row.config as DataTargetWidget;
        if (!required) {
          return acc;
        }
        SUM += 1;

        allowedTypes.forEach((type: string) => {
          acc[type] += 1;
          if (allowedTypes.length > 1) {
            acc.mixingOn = acc.mixingOn.add(type);
          }
        });
      }
      if (row.type === 'MultiDataTarget') {
        const {allowedTypes, minNumberOfTargets, required} = row.config as MultiDataTargetWidget;
        if (!required) {
          return acc;
        }
        SUM += Number(minNumberOfTargets) || 0;
        allowedTypes.forEach((type: string) => {
          acc[type] += Number(minNumberOfTargets) || 0;
          if (allowedTypes.length > 1) {
            acc.mixingOn = acc.mixingOn.add(type);
          }
        });
      }
      return acc;
    },
    {DIMENSION: 0, MEASURE: 0, TIME: 0, mixingOn: new Set()},
  );
  return {DIMENSION: counts.DIMENSION, MEASURE: counts.MEASURE, TIME: counts.TIME, SUM};
}

export function searchDimensionsCanMatch(
  template: Template,
  targetCols: string[],
  columns: ColumnHeader[],
): {canBeUsed: boolean; isComplete: boolean} {
  const colMap = makeColNameMap(columns);
  const desiredColumns = targetCols.map(key => colMap[trim(key)]);
  const config = template.widgets;
  const targets = config.filter(d => d.type === 'DataTarget') as TemplateWidget<DataTargetWidget>[];
  const multiTargets = config.filter(d => d.type === 'MultiDataTarget') as TemplateWidget<
    MultiDataTargetWidget
  >[];
  const numRequired = targets.filter(d => d.config.required).length;
  const usedTargets: Set<string> = new Set([]);
  const result = desiredColumns.every(col => {
    const availableSingleTargetField = targets
      .filter(d => !usedTargets.has(d.name))
      .find(d => col && d.config.allowedTypes.includes(col.type));
    const availableMultiTargetField = multiTargets.find(d => col && d.config.allowedTypes.includes(col.type));

    if (availableSingleTargetField) {
      usedTargets.add(availableSingleTargetField.name);
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
  return template && template.templateName === NONE.templateName ? 'Template Gallery' : template.templateName;
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

export function safeParse(code: string): string | boolean {
  let x = null;
  try {
    x = JSON.parse(code);
  } catch (e) {
    x = false;
  }
  return x;
}

export function makeCustomType(field: string): ColumnHeader {
  return {type: 'CUSTOM', field, originalType: 'CUSTOM', domain: []};
}

interface MakeOptionsForDropdownProps {
  template: Template;
  columns: ColumnHeader[];
  widget: TemplateWidget<DataTargetWidget | MultiDataTargetWidget>;
  useGroupsAsTypes?: boolean;
}
export function makeOptionsForDropdown(
  props: MakeOptionsForDropdownProps,
): {display: string; value: string; group: string | null}[] {
  const {template, columns, widget, useGroupsAsTypes} = props;
  return [
    {display: 'Select a value', value: null, group: null},
    ...(template.customCards || []).map(card => ({display: card, value: card, group: 'Template Fields'})),
  ].concat(
    columns
      .map(column => ({
        display: `${column.field} ${TEXT_TYPE[column.type]}`,
        value: column.field,
        group: useGroupsAsTypes
          ? column.type
          : widget.config.allowedTypes.includes(column.type)
          ? 'RECOMENDED'
          : 'OUT OF TYPE',
      }))
      .sort((a, b) => a.display.localeCompare(b.display)),
  );
}
