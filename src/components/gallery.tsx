import React, {useEffect} from 'react';
import {GenericAction, SetWidgetValuePayload} from '../actions/index';
import {Template, TemplateMap, ColumnHeader} from '../types';
import ProgramPreview from './program-preview';
import {searchDimensionsCanMatch, buildCounts, searchPredicate, serverPrefix, trim} from '../utils';
import {writeGallerySectionPref, getGallerySectionPref} from '../utils/local-storage';
import GALLERY from '../templates/gallery';
import {AUTHORS} from '../constants/index';
import {saveAs} from 'file-saver';
interface Props {
  columns: ColumnHeader[];
  chainActions: GenericAction<any>;
  deleteTemplate: GenericAction<string>;
  saveCurrentTemplate: GenericAction<void>;
  setEncodingMode: GenericAction<string>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  spec: any;
  templateMap: TemplateMap;
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
  }).then(() => {
    // TODO do something?
  });
}

function toExportStr(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-');
}
type MarkedTemplate = {template: Template; include: boolean};
function filterTemplates(
  templates: Template[],
  spec: any,
  columns: ColumnHeader[],
  search: string,
): MarkedTemplate[] {
  return templates
    .filter(template => {
      if (template.templateName === GALLERY.templateName) {
        return false;
      }
      return true;
    })
    .map(template => {
      const {canBeUsed} = searchDimensionsCanMatch(template, spec.dataTargetSearch as string[], columns);
      if (!canBeUsed) {
        return {include: false, template};
      }
      const nameIsValid = searchPredicate(search, template.templateName, template.templateDescription);
      if (!nameIsValid) {
        return {include: false, template};
      }

      const {SUM} = buildCounts(template);
      if (
        (spec.minRequiredTargets && spec.minRequiredTargets > SUM) ||
        (spec.maxRequiredTargets && spec.maxRequiredTargets < SUM)
      ) {
        return {include: false, template};
      }

      return {include: true, template};
    });
}

type TemplateGroup = {[x: string]: MarkedTemplate[]};
function groupBy(templates: MarkedTemplate[], accessor: (x: Template) => string): TemplateGroup {
  return templates.reduce((acc, row) => {
    const groupKey = accessor(row.template);
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
function toSection(templates: MarkedTemplate[], sectionStratagey: string): TemplateGroup {
  return Object.entries(groupBy(templates, sectionFunctionMap[sectionStratagey]))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((acc, [key, temps]) => {
      acc[key] = temps.sort((a, b) => a.template.templateName.localeCompare(b.template.templateName));
      return acc;
    }, {} as TemplateGroup);
}

export default function Gallery(props: Props): JSX.Element {
  const {
    columns,
    chainActions,
    deleteTemplate,
    setEncodingMode,
    spec,
    templates,
    userName,
    templateMap,
    setWidgetValue,
    saveCurrentTemplate,
  } = props;
  useEffect(() => {
    const secStrat = templateMap.paramValues.sectionStratagey;
    if (secStrat && secStrat !== getGallerySectionPref()) {
      writeGallerySectionPref(`${secStrat}`);
      const idx = GALLERY.widgets.findIndex(d => d.name === 'sectionStratagey');
      chainActions([
        (): any => setWidgetValue({key: 'defaultValue', value: secStrat, idx}),
        (): any => saveCurrentTemplate(),
      ]);
    }
    // and then update value in template?????
  }, [templateMap.paramValues.sectionStratagey]);

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
  const produceTemplateCard = (markedTemplate: MarkedTemplate, idx: number): JSX.Element => {
    const {template, include} = markedTemplate;
    const {isComplete} = searchDimensionsCanMatch(template, spec.dataTargetSearch as string[], columns);
    const madeByUser = template.templateAuthor === userName;
    const builtIn = template.templateAuthor === AUTHORS;
    const buttons = madeByUser
      ? ['Publish', 'Delete', 'Use', 'Save to Disc']
      : builtIn
      ? ['Use', 'Save to Disc']
      : ['Delete', 'Use', 'Save to Disc'];

    return (
      <div
        style={{opacity: include ? 1 : 0.2}}
        key={`${template.templateName}-${template.templateAuthor}-${idx}`}
      >
        <ProgramPreview
          buttons={buttons.map(makeButtonObject(template.templateName))}
          isComplete={isComplete}
          setEncodingMode={setEncodingMode}
          template={template}
          hideMatches={false}
          userName={userName}
        />
      </div>
    );
  };

  const filteredTemplates = filterTemplates(templates, spec, columns, trim(spec.SearchKey as string));
  return (
    <div className="gallery">
      {!filteredTemplates.length && <div>No templates match your query</div>}
      {Object.entries(toSection(filteredTemplates, spec.sectionStratagey)).map(([name, temps], idx) => {
        return (
          <div className="flex-down" key={`${name}-row-${idx}`}>
            {name !== `null` && <h1>{name}</h1>}
            <div className="template-card-sub-containers">{temps.map(produceTemplateCard)}</div>
          </div>
        );
      })}
    </div>
  );
}
