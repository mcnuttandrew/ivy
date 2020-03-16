import React from 'react';
import {GenericAction} from '../actions/index';
import {Template, ColumnHeader} from '../types';
import ProgramPreview from './program-preview';
import {searchDimensionsCanMatch, buildCounts, searchPredicate, serverPrefix, trim} from '../utils';
// import {getTemplateOrg, writeTemplateOrg} from '../utils/local-storage';
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

export const SORTS = [
  'template name',
  'min required measures',
  'min required dimensions',
  'min required times',
  'max allowed fields',
  'complexity',
];

function publish(templateName: string, template: Template): void {
  fetch(`${serverPrefix()}/publish`, {
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
    body: JSON.stringify({template, creator: template.templateAuthor}),
  }).then(x => {
    console.log(x);
  });
}

type MakeSortScoreType = (
  Sort: string,
) => (template: Template) => {score: number | string; template: Template};
const makeSortScore: MakeSortScoreType = (Sort: string) => (template): any => {
  const counts = buildCounts(template);
  let score = null;
  if (Sort === 'template name') {
    score = template.templateName;
  }
  if (Sort === 'null') {
    score = 0;
  }
  if (Sort === 'min required measures') {
    score = counts.MEASURE;
  }
  if (Sort === 'min required dimensions') {
    score = counts.DIMENSION;
  }
  if (Sort === 'min required times') {
    score = counts.TIME;
  }
  if (Sort === 'max allowed fields') {
    score = counts.SUM;
  }
  if (Sort === 'complexity') {
    score = (template.code.match(/\$cond/g) || []).length;
  }
  return {template, score};
};

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
  return templates
    .map(makeSortScore(spec.Sort))
    .sort((a, b) => {
      const sortResult =
        (spec['Reverse Sort'] ? -1 : 1) *
        (typeof a.score === 'string' && typeof b.score === 'string'
          ? (a.score as string).localeCompare(b.score as string)
          : (a.score as number) - (b.score as number));
      if (!sortResult) {
        return a.template.templateName.localeCompare(a.template.templateName);
      }
      return sortResult;
    })
    .reduce((acc, {template}) => {
      if (template.templateName === GALLERY.templateName) {
        return acc;
      }
      const {canBeUsed} = searchDimensionsCanMatch(template, spec.dataTargetSearch as string[], columns);
      if (!canBeUsed) {
        return acc;
      }
      const nameIsValid = searchPredicate(search, template.templateName, template.templateDescription);
      if (!nameIsValid) {
        return acc;
      }

      const {SUM} = buildCounts(template);
      if (
        (spec.minRequiredTargets && spec.minRequiredTargets > SUM) ||
        (spec.maxRequiredTargets && spec.maxRequiredTargets < SUM)
      ) {
        return acc;
      }

      return acc.concat(template);
    }, []);
}
// const [templateOrg, setTemplateOrg] = useState(getTemplateOrg());
// useEffect(() => {
//   const updatedOrg = templatesToKey(templates).reduce((acc, row: string) => {
//     if (!acc[row]) {
//       acc[row] = 'unsorted';
//     }
//     return acc;
//   }, templateOrg || {});
//   writeTemplateOrg(JSON.stringify(updatedOrg));
//   setTemplateOrg(updatedOrg);
// }, [templatesToKey(templates)]);

// const groups = Object.entries(templateOrg).reduce((acc, [group, key]: [string, string]) => {
//   acc[key] = (acc[key] || []).concat(group);
//   return acc;
// }, {} as {[x: string]: string[]});
// console.log(groups);

// const templatesToKey = (templates: Template[]): string[] =>
//   templates.map(d => `${d.templateName}-${d.templateAuthor}`);
export default function DataSearchMode(props: Props): JSX.Element {
  const {columns, deleteTemplate, setEncodingMode, spec, templates, userName} = props;

  const makeButtonObject = (templateName: string) => (key: string): {onClick: any; name: string} => {
    let onClick;
    if (key === 'Delete') {
      onClick = (): any => deleteTemplate(templateName);
    }
    if (key === 'Publish') {
      onClick = (): any => {
        const template = templates.find(template => template.templateName === templateName);
        publish(templateName, template);
      };
    }
    if (key === 'Use') {
      onClick = (): any => {
        setEncodingMode(templateName);
      };
    }
    if (key === 'Save to Disc') {
      onClick = (): any => {
        const template = templates.find(d => d.templateName === templateName);
        const fileName = `${toExportStr(templateName)}.${toExportStr(template.templateAuthor)}.ivy.json`;
        saveAs(JSON.stringify(template, null, 2), fileName);
      };
    }
    return {onClick, name: key};
  };

  const search = trim(spec.SearchKey as string);
  const filteredTemplates = filterTemplates(templates, spec, columns, search);
  const programs = filteredTemplates.map((template, idx) => {
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
        key={`${template.templateName}-${idx}`}
        setEncodingMode={setEncodingMode}
        template={template}
        userName={userName}
      />
    );
  });
  return (
    <div className="data-search-mode">
      <div className="program-containers">
        {!programs.length && <div>No templates match your query</div>}
        {programs}
      </div>
    </div>
  );
}
