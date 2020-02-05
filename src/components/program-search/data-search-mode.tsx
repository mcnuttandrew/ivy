import React from 'react';
import {GenericAction} from '../../actions/index';
import {ColumnHeader} from '../../types';
import {Template, TemplateMap} from '../../templates/types';
import ProgramPreview from './program-preview';
import {searchDimensionsCanMatch, buildCounts, searchPredicate} from '../../utils';
import {GRAMMAR_NAME, GRAMMAR_DESC, NONE_TEMPLATE} from '../../constants/index';

interface Props {
  columns: ColumnHeader[];
  setEncodingMode: GenericAction<string>;
  templates: Template[];
  templateMap: TemplateMap;
}

export default function DataSearchMode(props: Props): JSX.Element {
  const {setEncodingMode, templates, templateMap, columns} = props;
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
      />
    );
    return acc.concat(newProg);
  }, []);
  return (
    <div className="data-search-mode">
      <div className="program-containers">
        {searchPredicate(templateMap.SearchKey as string, GRAMMAR_NAME, GRAMMAR_DESC) && (
          <ProgramPreview
            templateName={GRAMMAR_NAME}
            templateDescription={GRAMMAR_DESC}
            setEncodingMode={setEncodingMode}
            templateAuthor={'BUILT_IN'}
            typeCounts={{DIMENSION: '≤9', MEASURE: '≤9', TIME: '≤9', SUM: '9'}}
          />
        )}
        {programs}
        {!programs.length && <div>No templates match your query</div>}
      </div>
    </div>
  );
}
