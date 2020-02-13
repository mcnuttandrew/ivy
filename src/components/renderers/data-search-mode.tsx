import React from 'react';
import {GenericAction} from '../../actions/index';
import {ColumnHeader} from '../../types';
import {Template, TemplateMap} from '../../templates/types';
import ProgramPreview from '../program-preview';
import {searchDimensionsCanMatch, buildCounts, searchPredicate, serverPrefix} from '../../utils';
import {thumbnailLocation} from '../../utils/thumbnail';
import {GRAMMAR_NAME, GRAMMAR_DESC, NONE_TEMPLATE} from '../../constants/index';

interface Props {
  columns: ColumnHeader[];
  deleteTemplate: GenericAction<string>;
  setEncodingMode: GenericAction<string>;
  templates: Template[];
  templateMap: TemplateMap;
}

function publish(templateName: string, template: Template): void {
  const thumbnail = thumbnailLocation(templateName);
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
    body: JSON.stringify({
      template,
      templateImg: thumbnail === 'logo.png' ? null : thumbnail,
      creator: 'EXAMPLE_CREATOR',
    }), // body data type must match "Content-Type" header
  }).then(x => {
    console.log(x);
  });
}

export default function DataSearchMode(props: Props): JSX.Element {
  const {setEncodingMode, templates, templateMap, columns, deleteTemplate} = props;
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

  const programs = templates.reduce((acc, template, idx) => {
    if (template.templateName === NONE_TEMPLATE) {
      return acc;
    }
    const {canBeUsed, isComplete} = searchDimensionsCanMatch(template, templateMap, columns);
    if (!canBeUsed) {
      return acc;
    }
    const nameIsValid = searchPredicate(
      templateMap.SearchKey as string,
      template.templateName,
      template.templateDescription,
    );
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
        {searchPredicate(templateMap.SearchKey as string, GRAMMAR_NAME, GRAMMAR_DESC) && (
          <ProgramPreview
            templateName={GRAMMAR_NAME}
            templateDescription={GRAMMAR_DESC}
            setEncodingMode={setEncodingMode}
            templateAuthor={'BUILT_IN'}
            buttons={[]}
            typeCounts={{
              complete: {DIMENSION: '≤9', MEASURE: '≤9', TIME: '≤9', SUM: '9'},
              required: {DIMENSION: '≤9', MEASURE: '≤9', TIME: '≤9', SUM: '9'},
            }}
          />
        )}
        {programs}
      </div>
    </div>
  );
}
