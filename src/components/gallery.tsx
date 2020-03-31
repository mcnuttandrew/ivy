import React from 'react';
import {GenericAction} from '../actions/index';
import {Template, ColumnHeader} from '../types';
import ProgramPreview from './program-preview';
import {searchDimensionsCanMatch, buildCounts, searchPredicate, serverPrefix, trim} from '../utils';
import GALLERY from '../templates/gallery';
import {AUTHORS} from '../constants/index';
import {saveAs} from 'file-saver';
interface Props {
  columns: ColumnHeader[];
  deleteTemplate: GenericAction<string>;
  setEncodingMode: GenericAction<string>;
  spec: any;
  templates: Template[];
  userName: string;
}

export const SECTIONS = ['alphabetical', 'author', 'language', 'vis key word', 'none'];

function publish(template: Template): void {
  fetch(`${serverPrefix()}/publish`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({template, creator: template.templateAuthor}),
  }).then(x => {
    // TODO do something?
    console.log(x);
  });
}

function toExportStr(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-');
}

function filterTemplates(
  templates: Template[],
  spec: any,
  columns: ColumnHeader[],
  search: string,
): Template[] {
  return templates.filter(template => {
    if (template.templateName === GALLERY.templateName) {
      return false;
    }
    const {canBeUsed} = searchDimensionsCanMatch(template, spec.dataTargetSearch as string[], columns);
    if (!canBeUsed) {
      return false;
    }
    const nameIsValid = searchPredicate(search, template.templateName, template.templateDescription);
    if (!nameIsValid) {
      return false;
    }

    const {SUM} = buildCounts(template);
    if (
      (spec.minRequiredTargets && spec.minRequiredTargets > SUM) ||
      (spec.maxRequiredTargets && spec.maxRequiredTargets < SUM)
    ) {
      return false;
    }

    return true;
  }, []);
}

type TemplateGroup = {[x: string]: Template[]};
function groupBy(templates: Template[], accessor: (x: Template) => string): TemplateGroup {
  return templates.reduce((acc, row) => {
    const groupKey = accessor(row);
    acc[groupKey] = (acc[groupKey] || []).concat(row);
    return acc;
  }, {} as TemplateGroup);
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
function checkName(template: Template, key: string): boolean {
  const nameIncludes = template.templateName.toLowerCase().includes(key);
  const descIncludes = template.templateDescription.toLowerCase().includes(key);
  return nameIncludes || descIncludes;
}

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
};
function toSection(templates: Template[], sectionStratagey: string): TemplateGroup {
  return Object.entries(groupBy(templates, sectionFunctionMap[sectionStratagey]))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((acc, [key, temps]) => {
      acc[key] = temps.sort((a, b) => a.templateName.localeCompare(b.templateName));
      return acc;
    }, {} as TemplateGroup);
}

export default function Gallery(props: Props): JSX.Element {
  const {columns, deleteTemplate, setEncodingMode, spec, templates, userName} = props;

  const makeButtonObject = (templateName: string) => (key: string): {onClick: any; name: string} => {
    let onClick;
    if (key === 'Delete') {
      onClick = (): any => deleteTemplate(templateName);
    }
    if (key === 'Publish') {
      onClick = (): any => publish(templates.find(template => template.templateName === templateName));
    }
    if (key === 'Use') {
      onClick = (): any => setEncodingMode(templateName);
    }
    if (key === 'Save to Disc') {
      onClick = (): any => {
        const template = templates.find(d => d.templateName === templateName);
        const fileName = `${toExportStr(templateName)}.${toExportStr(template.templateAuthor)}.ivy.json`;
        const outputFile = new Blob([JSON.stringify(template, null, 2)], {type: 'text/plain;charset=utf-8'});
        saveAs(outputFile, fileName);
      };
    }
    return {onClick, name: key};
  };
  const produceTemplateCard = (template: Template, idx: number): JSX.Element => {
    const {isComplete} = searchDimensionsCanMatch(template, spec.dataTargetSearch as string[], columns);
    const madeByUser = template.templateAuthor === userName;
    const builtIn = template.templateAuthor === AUTHORS;
    const buttons = madeByUser
      ? ['Publish', 'Delete', 'Use', 'Save to Disc']
      : builtIn
      ? ['Use', 'Save to Disc']
      : ['Delete', 'Use', 'Save to Disc'];

    return (
      <ProgramPreview
        buttons={buttons.map(makeButtonObject(template.templateName))}
        isComplete={isComplete}
        key={`${template.templateName}-${template.templateAuthor}-${idx}`}
        setEncodingMode={setEncodingMode}
        template={template}
        hideMatches={false}
        userName={userName}
      />
    );
  };

  const filteredTemplates = filterTemplates(templates, spec, columns, trim(spec.SearchKey as string));
  return (
    <div className="gallery">
      {!filteredTemplates.length && <div>No templates match your query</div>}
      {Object.entries(toSection(filteredTemplates, spec.sectionStratagey)).map(([name, temps]) => {
        return (
          <div className="flex-down" key={`${name}-row`}>
            {name !== `null` && <h1>{name}</h1>}
            <div className="template-card-sub-containers">{temps.map(produceTemplateCard)}</div>
          </div>
        );
      })}
    </div>
  );
}
