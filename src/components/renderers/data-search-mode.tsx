import React from 'react';
import {GenericAction} from '../../actions/index';
import {ColumnHeader} from '../../types';
import {Template} from '../../templates/types';
import ProgramPreview from '../program-preview';
import {searchDimensionsCanMatch, buildCounts, searchPredicate, serverPrefix, trim} from '../../utils';
import NONE_TEMPLATE from '../../templates/example-templates/none';
interface Props {
  columns: ColumnHeader[];
  deleteTemplate: GenericAction<string>;
  setEncodingMode: GenericAction<string>;
  spec: any;
  templates: Template[];
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
    score = (template.code.match(/CONDITIONAL/g) || []).length;
  }
  return {template, score};
};

export default function DataSearchMode(props: Props): JSX.Element {
  const {columns, deleteTemplate, setEncodingMode, spec, templates} = props;
  const makeButtonObject = (templateName: string) => (key: string): {onClick: any; name: string} => {
    let onClick;
    if (key === 'Delete') {
      onClick = (): any => deleteTemplate(templateName);
    }
    if (key === 'Publish') {
      onClick = (): any => {
        const template = templates.find(template => template.templateName === templateName);
        if (!template) {
          return;
        }
        publish(templateName, template);
      };
    }
    return {onClick, name: key};
  };
  const search = trim(spec.SearchKey as string);
  const programs = templates
    .map(makeSortScore(spec.Sort))
    .sort(
      (a, b) =>
        (spec['Reverse Sort'] ? -1 : 1) *
        (typeof a.score === 'string' && typeof b.score === 'string'
          ? (a.score as string).localeCompare(b.score as string)
          : (a.score as number) - (b.score as number)),
    )
    .reduce((acc, {template}, idx) => {
      if (template.templateName === NONE_TEMPLATE.templateName) {
        return acc;
      }
      const {canBeUsed, isComplete} = searchDimensionsCanMatch(
        template,
        spec.dataTargetSearch as string[],
        columns,
      );
      if (!canBeUsed) {
        return acc;
      }
      const nameIsValid = searchPredicate(search, template.templateName, template.templateDescription);
      if (!nameIsValid) {
        return acc;
      }
      const newProg = (
        <ProgramPreview
          templateName={template.templateName}
          templateDescription={template.templateDescription}
          templateAuthor={template.templateAuthor}
          setEncodingMode={setEncodingMode}
          isComplete={isComplete}
          key={`${template.templateName}-${idx}`}
          typeCounts={buildCounts(template)}
          buttons={['Publish', 'Delete'].map(makeButtonObject(template.templateName))}
        />
      );
      return acc.concat(newProg);
    }, []);
  return (
    <div className="data-search-mode">
      <div className="program-containers">
        {!programs.length && <div>No templates match your query</div>}
        {/* LEFT Comment out for now, but it's the beginning of the end for T0 */}
        {/* {searchPredicate(search, GRAMMAR_NAME, GRAMMAR_DESC) && (
          <ProgramPreview
            templateName={GRAMMAR_NAME}
            templateDescription={GRAMMAR_DESC}
            setEncodingMode={setEncodingMode}
            templateAuthor={'HYDRA-AUTHORS'}
            buttons={[]}
            typeCounts={{DIMENSION: 0, MEASURE: 0, TIME: 0, SUM: 9}}
          />
        )} */}
        {programs}
      </div>
    </div>
  );
}
