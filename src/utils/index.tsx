import DomToImage from 'dom-to-image';
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
import {TEXT_TYPE, MATERIALIZING} from '../constants/index';
import GALLERY from '../templates/gallery';
import {AppState, ColumnHeader} from '../types';

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

export function serializeTemplate(template: Template): string {
  // the commented out chunks of this are for preparring the code annotation figure
  return stringify(
    {
      $schema: 'https://kind-goldwasser-f3ce26.netlify.com/assets/hydra-template.json',
      templateName: template.templateName,
      templateDescription: template.templateDescription,
      templateAuthor: template.templateAuthor,
      templateLanguage: template.templateLanguage,
      disallowFanOut: template.disallowFanOut,
      customCards: template.customCards,
      params: template.widgets,
      // body: JSON.parse(template.code),
      code: 'SEE BODY',
    },
    {maxLength: 120},
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

const USE_LOCAL = false;
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

export function buildCounts(
  template: Template,
): {DIMENSION: number; MEASURE: number; TIME: number; SUM: number} {
  let SUM = 0;
  const counts = template.widgets.reduce(
    (acc: any, row: GenWidget) => {
      if (row.type === 'DataTarget') {
        const {allowedTypes, required} = row.config as DataTargetWidget;
        SUM += 1;
        if (!required) {
          return acc;
        }

        allowedTypes.forEach((type: string) => {
          acc[type] += 1;
          if (allowedTypes.length > 1) {
            acc.mixingOn = acc.mixingOn.add(type);
          }
        });
      }
      if (row.type === 'MultiDataTarget') {
        const {
          allowedTypes,
          minNumberOfTargets,
          maxNumberOfTargets,
          required,
        } = row.config as MultiDataTargetWidget;
        SUM += Number(maxNumberOfTargets) || 0;
        if (!required) {
          return acc;
        }
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

export const toSet = (widgets: GenWidget[]): Set<string> =>
  widgets.reduce((acc, row) => acc.add(row.name), new Set() as Set<string>);

export function updateThumbnail(templateName: string, authorKey: string): Promise<void> {
  const node = document.querySelector('.chart-container div');
  return DomToImage.toJpeg(node, {quality: 0.1}).then(templateImg => {
    return fetch(`${serverPrefix()}/save-thumbnail`, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
      body: JSON.stringify({templateName, authorKey, templateImg}), // body data type must match "Content-Type" header
    }).then(x => {
      console.log('finish pub');
      console.log(x);
    });
  });
}

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
