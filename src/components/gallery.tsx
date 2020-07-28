import React, {useEffect, useState} from 'react';
import {GenericAction, SetWidgetValuePayload} from '../actions/index';
import {Template, TemplateMap, ColumnHeader} from '../types';
import TemplateCard from './template-card';
import {DEFAULT_TEMPLATES} from '../templates';
import {FETCH_PARMS} from '../constants';
import {
  searchDimensionsCanMatch,
  buildCounts,
  searchPredicate,
  serverPrefix,
  trim,
  toSection,
} from '../utils';
import {writeGallerySectionPref, getGallerySectionPref} from '../utils/local-storage';
import GALLERY from '../templates/gallery';
interface Props {
  columns: ColumnHeader[];
  saveCurrentTemplate: GenericAction<void>;
  setEncodingMode: GenericAction<string>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  spec: any;
  templateMap: TemplateMap;
}

type MarkedTemplate = {template: Template; include: boolean};
function filterTemplates(
  templates: Template[],
  spec: any,
  columns: ColumnHeader[],
  search: string,
): MarkedTemplate[] {
  return templates.map(template => {
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

export default function Gallery(props: Props): JSX.Element {
  const [templates, setTemplates] = useState([]);
  const {columns, setEncodingMode, spec, templateMap, setWidgetValue, saveCurrentTemplate} = props;
  useEffect(() => {
    const secStrat = templateMap.paramValues.sectionStratagey;
    if (secStrat && secStrat !== getGallerySectionPref()) {
      writeGallerySectionPref(`${secStrat}`);
      const idx = GALLERY.widgets.findIndex(d => d.name === 'sectionStratagey');
      setWidgetValue({key: 'defaultValue', value: secStrat, idx});
      saveCurrentTemplate();
    }
    // and then update value in template?????
  }, [templateMap.paramValues.sectionStratagey]);

  useEffect(() => {
    fetch(`${serverPrefix()}/templates`, FETCH_PARMS as any)
      .then(x => x.json())
      .then(x => {
        setTemplates(DEFAULT_TEMPLATES.concat(x.map((el: any) => el.template)));
      });
  }, []);

  const produceTemplateCard = (markedTemplate: MarkedTemplate, idx: number): JSX.Element => {
    const {template, include} = markedTemplate;
    const {isComplete} = searchDimensionsCanMatch(template, spec.dataTargetSearch as string[], columns);

    return (
      <div
        style={{opacity: include ? 1 : 0.2}}
        key={`${template.templateName}-${template.templateAuthor}-${idx}`}
      >
        <TemplateCard
          isComplete={isComplete}
          setEncodingMode={setEncodingMode}
          template={template}
          hideMatches={false}
        />
      </div>
    );
  };

  const filteredTemplates = filterTemplates(templates, spec, columns, trim(spec.SearchKey as string));
  return (
    <div className="gallery">
      {!filteredTemplates.length && <div>No templates match your query</div>}
      {Object.entries(toSection(filteredTemplates, spec.sectionStratagey, new Set())).map(
        ([name, temps], idx) => {
          return (
            <div className="flex-down" key={`${name}-row-${idx}`}>
              {name !== `null` && <h1>{name}</h1>}
              <div className="template-card-sub-containers">{temps.map(produceTemplateCard)}</div>
            </div>
          );
        },
      )}
    </div>
  );
}
