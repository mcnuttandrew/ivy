import React from 'react';
import {GenericAction} from '../actions/index';
import Tooltip from 'rc-tooltip';

import {TiInfoLarge} from 'react-icons/ti';

import GALLERY from '../templates/gallery';
import {ColumnHeader, Template, TemplateMap} from '../types';
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
  if (template.templateName === GALLERY.templateName) {
    return <div />;
  }
  const viewsOfInterest = template.widgets
    .filter(x => targetTypes.has(x.type))
    .reduce((acc, widget) => {
      if (templateMap.paramValues[widget.name]) {
        return acc.concat(templateMap.paramValues[widget.name]);
      }
      return acc;
    }, [] as string[]);
  const relatedViews: Template[] = templates.filter(x => {
    if (x.templateName === GALLERY.templateName || x.templateName === template.templateName) {
      return false;
    }
    const {canBeUsed, isComplete} = searchDimensionsCanMatch(x, viewsOfInterest, columns);
    return canBeUsed && isComplete;
  });
  return (
    <div className="flex-down">
      <h5 className="flex">
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
