import React from 'react';
import {GenericAction} from '../actions/index';
import Tooltip from 'rc-tooltip';

import {TiInfoLarge} from 'react-icons/ti';

import NONE_TEMPLATE from '../templates/example-templates/none';
import {Template, TemplateMap} from '../templates/types';
import {ColumnHeader} from '../types';
import {searchDimensionsCanMatch} from '../utils';

interface Props {
  columns: ColumnHeader[];
  setEncodingMode?: GenericAction<string>;
  templateMap: TemplateMap;
  template: Template;
  templates: Template[];
}
const targetTypes = new Set(['DataTarget', 'MultiDataTarget']);
export default function RelatedViews(props: Props): JSX.Element {
  const {templates, templateMap, columns, template, setEncodingMode} = props;
  if (template.templateName === NONE_TEMPLATE.templateName) {
    return <div />;
  }
  const viewsOfInterest = template.widgets
    .filter(x => targetTypes.has(x.type))
    .reduce((acc, widget) => {
      if (templateMap[widget.name]) {
        return acc.concat(templateMap[widget.name]);
      }
      return acc;
    }, [] as string[]);
  const relatedViews: Template[] = templates.filter(x => {
    if (x.templateName === NONE_TEMPLATE.templateName || x.templateName === template.templateName) {
      return false;
    }
    const {canBeUsed, isComplete} = searchDimensionsCanMatch(x, viewsOfInterest, columns);
    return canBeUsed && isComplete;
  });
  return (
    <div className="flex-down">
      <h5>
        <span>Related Views</span>
        <Tooltip
          placement="top"
          trigger="click"
          overlay={
            <div className="tooltip-internal">
              These are templates that are completely filled out from the current view
            </div>
          }
        >
          <div>
            <TiInfoLarge />
          </div>
        </Tooltip>
      </h5>
      {relatedViews.map(x => (
        <div className="related-views-button" key={x.templateName}>
          <span onClick={(): any => setEncodingMode(x.templateName)}>{x.templateName}</span>
          <Tooltip
            placement="top"
            trigger="click"
            overlay={
              <div className="tooltip-internal flex-down">
                <h3>{x.templateName}</h3>
                <p>{x.templateDescription}</p>
              </div>
            }
          >
            <div>
              <TiInfoLarge />
            </div>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
