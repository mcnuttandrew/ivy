// import DomToImage from 'dom-to-image';
import stringify from 'json-stringify-pretty-compact';
import {
  DataTargetWidget,
  MultiDataTargetWidget,
  Template,
  TemplateMap,
  Widget,
  GenWidget,
  CustomCard,
  Suggestion,
} from '../types';
import {MATERIALIZING, USE_LOCAL, BINDER} from '../constants/index';
import GALLERY from '../templates/gallery';
import {AppState, ColumnHeader} from '../types';

// eslint-disable-next-line no-console
export const log = console.log;
// eslint-disable-next-line no-console
export const logError = console.error;

export const NULL = (): void => {};

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

const PREP_FOR_SCREENSHOT = false;

export function serializeTemplate(template: Template): string {
  // the commented out chunks of this are for preparring the code annotation figure
  if (PREP_FOR_SCREENSHOT) {
    return stringify(
      {
        $schema: 'https://ivy-vis.netlify.com/assets/ivy.0.0.1.json',
        templateName: template.templateName,
        templateDescription: template.templateDescription,
        templateAuthor: template.templateAuthor,
        templateLanguage: template.templateLanguage,
        params: template.widgets,
        body: JSON.parse(template.code),
      },
      {maxLength: 130},
    );
  }
  return stringify(
    {
      $schema: 'https://ivy-vis.netlify.com/assets/ivy.0.0.1.json',
      templateName: template.templateName,
      templateDescription: template.templateDescription,
      templateAuthor: template.templateAuthor,
      templateLanguage: template.templateLanguage,
      disallowFanOut: template.disallowFanOut,
      customCards: template.customCards,
      widgets: template.widgets,
      code: 'SEE BODY',
    },
    {maxLength: 110},
  );
}

export function deserializeTemplate(templateString: string): Template {
  const code = JSON.parse(templateString);
  return {
    templateName: code.templateName,
    templateDescription: code.templateDescription,
    disallowFanOut: code.disallowFanOut,
    code: 'SEE CODE EDITOR',
    templateLanguage: code.templateLanguage,
    widgets: code.widgets,
    templateAuthor: code.templateAuthor,
    customCards: code.customCards,
  };
}

type SaveState = 'NA' | 'NOT FOUND' | 'EQUAL' | 'DIFFERENT';
export function getTemplateSaveState(base: AppState): SaveState {
  const template = base.currentTemplateInstance;
  const associatedUpstreamTemplate = base.templates.find(t => t.templateName === template.templateName);
  if (!associatedUpstreamTemplate) {
    return 'NOT FOUND';
  }
  return associatedUpstreamTemplate === template ? 'EQUAL' : 'DIFFERENT';
}

export function serverPrefix(): string {
  return USE_LOCAL ? 'http://localhost:5000' : 'https://hydra-template-server.herokuapp.com';
}

export const computeValidAddNexts = (template: Template, templateMap: TemplateMap): Set<string> => {
  const dims = ['DIMENSION', 'MEASURE', 'TIME'];
  const dimCounter = dims.reduce((acc: any, key) => ({...acc, [key]: []}), {});

  const toSet = (counter: {[x: string]: any[]}): Set<string> =>
    new Set(
      Object.entries(counter)
        .filter(x => x[1].length)
        .map(x => x[0]),
    );

  const result = template.widgets
    .filter(d => ['MultiDataTarget', 'DataTarget'].includes(d.type))
    .reduce((acc: any, widget: any) => {
      const type = widget.type;
      const name = widget.name;
      const val = templateMap.paramValues[name];

      if (
        type === 'MultiDataTarget' &&
        (!val || val.length < widget.config.maxNumberOfTargets || !widget.config.maxNumberOfTargets)
      ) {
        (widget.config.allowedTypes as string[])
          .filter(d => dimCounter[d])
          .forEach((allowedType: string): void => acc[allowedType].push(name));
      }
      // dont try figure it out if it's in use, needs to be before multidatatarget which has a truthy null, []
      if (val) {
        return acc;
      }

      if (type === 'DataTarget') {
        (widget.config.allowedTypes as string[])
          .filter(d => dimCounter[d])
          .forEach((allowedType: string): void => acc[allowedType].push(name));
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

const toKey = (arr: string[]): string =>
  arr
    .slice()
    .sort()
    .join('-');

export function buildCounts(template: Template, useTotal?: boolean): {[x: string]: number; SUM: number} {
  return template.widgets.reduce(
    (acc: any, row: GenWidget) => {
      if (row.type === 'DataTarget') {
        const {allowedTypes, required} = row.config as DataTargetWidget;
        const comboKey = toKey(allowedTypes);
        acc.SUM += 1;
        if (useTotal || required) {
          acc[comboKey] = (acc[comboKey] || 0) + 1;
        }
      }
      if (row.type === 'MultiDataTarget') {
        const {
          allowedTypes,
          minNumberOfTargets,
          maxNumberOfTargets,
          required,
        } = row.config as MultiDataTargetWidget;
        acc.SUM += Number(maxNumberOfTargets) || 0;
        const comboKey = toKey(allowedTypes);
        if (useTotal || required) {
          acc[comboKey] = Number(acc[comboKey] || 0) + Number(minNumberOfTargets);
        }
      }
      return acc;
    },
    {SUM: 0},
  );
}

export function searchDimensionsCanMatch(
  template: Template,
  targetCols: string[],
  columns: ColumnHeader[],
): {canBeUsed: boolean; isComplete: boolean} {
  const colMap = makeColNameMap(columns);
  const desiredColumns = targetCols.map(key => colMap[trim(key)]);
  const config = template.widgets;
  const targets = config.filter(d => d.type === 'DataTarget') as Widget<DataTargetWidget>[];
  const multiTargets = config.filter(d => d.type === 'MultiDataTarget') as Widget<MultiDataTargetWidget>[];
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
  return template && template.templateName === GALLERY.templateName
    ? 'Template Gallery'
    : template.templateName;
}

export function makeCustomType(customCard: CustomCard): ColumnHeader {
  return {
    type: 'CUSTOM',
    field: customCard.name,
    originalType: 'CUSTOM',
    domain: [],
    summary: {description: customCard.description},
  };
}

export function getOrMakeColumn(
  columnName: string,
  columns: ColumnHeader[],
  template: Template,
): ColumnHeader | null {
  const column = columns.find(({field}) => columnName && field === columnName);
  if (column) {
    return column;
  }
  if ((template.customCards || []).find(x => x.name === columnName) || columnName === `${MATERIALIZING}`) {
    return makeCustomType({name: columnName, description: ''});
  }
  return null;
}

interface MakeOptionsForDropdownProps {
  template: Template;
  columns: ColumnHeader[];
  widget: Widget<DataTargetWidget | MultiDataTargetWidget>;
  useGroupsAsTypes?: boolean;
}
export function makeOptionsForDropdown(
  props: MakeOptionsForDropdownProps,
): {display: string; value: string; group: string | null}[] {
  const {template, columns, widget, useGroupsAsTypes} = props;
  return [
    {display: 'Select a value', value: null, group: null},
    ...(template.customCards || []).map(({name}) => ({display: name, value: name, group: 'Template Fields'})),
  ].concat(
    columns
      .map(column => ({
        display: `${column.field} ${column.type}`,
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

export const toSet = (widgets: GenWidget[]): Set<string> =>
  widgets.reduce((acc, row) => acc.add(row.name), new Set() as Set<string>);

export function removeFirstInstanceOf(a: string[], key: string): string[] {
  let hasFound = false;
  return a
    .map(d => d)
    .filter(x => {
      if (hasFound) {
        return true;
      }
      if (x === key) {
        hasFound = true;
        return false;
      }
      return true;
    });
}

export const bagDifference = (a: string[], b: string[]): string[] => b.reduce(removeFirstInstanceOf, a);

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

export function toExportStr(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-');
}

/**
 * Convert an object of key values to be url query params
 * @param obj
 */
export function toQueryParams(obj: {[x: string]: any}): string {
  const query = Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return query.length ? `?${query}` : '';
}

export const SECTIONS = ['alphabetical', 'author', 'language', 'vis key word', 'none'];
function checkName(template: Template, key: string): boolean {
  const nameIncludes = template.templateName.toLowerCase().includes(key);
  const descIncludes = (template.templateDescription || '').toLowerCase().includes(key);
  return nameIncludes || descIncludes;
}
const visNameCombos = [
  {key: 'exotic', synonyms: ['3d', 'cloud', 'gauge', 'mosaic', 'treemap', 'joy']},
  {key: 'explore', synonyms: ['explor', 'multi-dimensional']},
  {key: 'distribution', synonyms: ['dot', 'univariate', 'unit']},
  {key: 'area', synonyms: []},
  {key: 'trend', synonyms: []},
  {key: 'bar', synonyms: ['histogram']},
  {key: 'scatter', synonyms: []},
  {key: 'radial', synonyms: ['pie', 'radar']},
  {key: 'simple', synonyms: ['data table', 'bignumber']},
];

type Group = {[x: string]: any[]};
function groupBy(templates: any[], accessor: (x: any) => string): Group {
  return templates.reduce((acc, row) => {
    const groupKey = accessor(row.template);
    acc[groupKey] = (acc[groupKey] || []).concat(row);
    return acc;
  }, {} as Group);
}
export function toSection(templates: any[], sectionStratagey: string, favorites: Set<string>): Group {
  const sectionFunctionMap: {[x: string]: (d: Template) => any} = {
    alphabetical: d => d.templateName[0].toUpperCase(),
    author: d => d.templateAuthor,
    language: d => d.templateLanguage,
    'vis key word': d => {
      const match = visNameCombos.find(({key, synonyms}) =>
        [key, ...synonyms].some((str: string) => checkName(d, str)),
      );
      return (match && match.key) || 'other';
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    none: d => null,
    favorites: d => {
      const key = `${d.templateName}${BINDER}${d.templateAuthor}`;
      return favorites.has(key) ? 'Favorites' : 'Other';
    },
  };
  return Object.entries(groupBy(templates, sectionFunctionMap[sectionStratagey]))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((acc, [key, temps]) => {
      acc[key] = temps.sort((a, b) => {
        return a.template.templateName.localeCompare(b.template.templateName);
      });
      return acc;
    }, {} as Group);
}
