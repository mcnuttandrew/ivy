import React from 'react';
import {GenericAction} from '../../actions/index';
import {ColumnHeader} from '../../types';
import {Template, TemplateMap, TemplateWidget, WidgetSubType, DataTargetWidget} from '../../templates/types';
import ProgramPreview from './program-preview';
import {makeColNameMap} from '../../utils';

interface Props {
  columns: ColumnHeader[];
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

function buildCounts(template: Template): any {
  let targetCount = 0;
  const counts = template.widgets.reduce(
    (acc: any, row: TemplateWidget<WidgetSubType>) => {
      if (row.widgetType === 'DataTarget') {
        targetCount += 1;
        const config = row.widget as DataTargetWidget;
        config.allowedTypes.forEach((type: string) => {
          acc[type] += 1;
          if (config.allowedTypes.length > 1) {
            acc.mixingOn = acc.mixingOn.add(type);
          }
        });
      }
      return acc;
    },
    {DIMENSION: 0, MEASURE: 0, TIME: 0, mixingOn: new Set()},
  );
  return {
    DIMENSION: `${counts.mixingOn.has('DIMENSION') ? '≤' : ''}${counts.DIMENSION}`,
    MEASURE: `${counts.mixingOn.has('MEASURE') ? '≤' : ''}${counts.MEASURE}`,
    TIME: `${counts.mixingOn.has('TIME') ? '≤' : ''}${counts.TIME}`,
    SUM: `${targetCount}`,
  };
}

function searchDimensionsCanMatch(
  template: Template,
  templateMap: TemplateMap,
  columns: ColumnHeader[],
): boolean {
  const colMap = makeColNameMap(columns);
  const targetFields = (templateMap.dataTargetSearch as string[]).map(key => colMap[key]);
  return true;
}

const GRAMMAR_NAME = 'grammer';
const GRAMMAR_DESC = 'Tableau-style grammar of graphics';
export default function DataSearchMode(props: Props): JSX.Element {
  const {setEncodingMode, templates, templateMap, columns} = props;
  return (
    <div className="data-search-mode">
      <div className="program-containers">
        {searchPredicate(templateMap.SearchKey as string, GRAMMAR_DESC, GRAMMAR_DESC) && (
          <ProgramPreview
            templateName={GRAMMAR_NAME}
            templateDescription={GRAMMAR_DESC}
            setEncodingMode={setEncodingMode}
            templateAuthor={'BUILT_IN'}
            typeCounts={{DIMENSION: '≤9', MEASURE: '≤9', TIME: '≤9', SUM: '9'}}
          />
        )}
        {templates
          .filter(
            template =>
              template.templateName !== '_____none_____' &&
              searchDimensionsCanMatch(template, templateMap, columns),
          )
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
              typeCounts={buildCounts(template)}
            />
          ))}
      </div>
    </div>
  );
}
