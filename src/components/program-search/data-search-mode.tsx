import React from 'react';
import {GenericAction} from '../../actions/index';
import {Template, TemplateMap} from '../../templates/types';
import ProgramPreview from './program-preview';

interface Props {
  setEncodingMode: GenericAction<string>;
  templates: Template[];
  templateMap: TemplateMap;
}

// used for filtering out unsearched templates
function searchPredicate(searchKey: string, templateName: string, templateDescription: string): boolean {
  const matchDescription = templateDescription && templateDescription.toLowerCase().includes(searchKey || '');
  const matchName = templateName && templateName.toLowerCase().includes(searchKey || '');
  return matchDescription || matchName;
}

const GRAMMAR_NAME = 'grammer';
const GRAMMAR_DESC = 'Tableau-style grammar of graphics';
export default function DataSearchMode(props: Props): JSX.Element {
  const {setEncodingMode, templates, templateMap} = props;
  return (
    <div className="data-search-mode">
      <div className="program-containers">
        {searchPredicate(templateMap.SearchKey as string, GRAMMAR_DESC, GRAMMAR_DESC) && (
          <ProgramPreview
            templateName={GRAMMAR_NAME}
            templateDescription={GRAMMAR_DESC}
            setEncodingMode={setEncodingMode}
            templateAuthor={'BUILT_IN'}
            typeCounts={{DIMENSION: 'X', MEASURE: 'Y', TIME: 'Z'}}
          />
        )}
        {templates
          .filter(template => template.templateName !== '_____none_____')
          .filter(x =>
            searchPredicate(templateMap.SearchKey as string, x.templateName, x.templateDescription),
          )
          .map((template: Template, idx: number) => (
            <ProgramPreview
              templateName={template.templateName}
              templateDescription={template.templateDescription}
              templateAuthor={template.templateAuthor}
              setEncodingMode={setEncodingMode}
              key={`${template.templateName}-${idx}`}
              typeCounts={{DIMENSION: 'X', MEASURE: 'Y', TIME: 'Z'}}
            />
          ))}
      </div>
    </div>
  );
}
