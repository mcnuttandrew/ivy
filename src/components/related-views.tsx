import React from 'react';
import {GenericAction} from '../actions/index';
import Tooltip from 'rc-tooltip';

import GALLERY from '../templates/gallery';
import {ColumnHeader, Template, TemplateMap} from '../types';
import {searchDimensionsCanMatch} from '../utils';
import TemplateCard from './template-card';
import {TiThLargeOutline} from 'react-icons/ti';

const targetTypes = new Set(['DataTarget', 'MultiDataTarget']);
interface PopoverContentsProps {
  relatedViews: Template[];
  setEncodingMode: GenericAction<string>;
}
function PopoverContents(props: PopoverContentsProps): JSX.Element {
  const {relatedViews, setEncodingMode} = props;
  return (
    <div className="related-templates-popover">
      <h3>Related Templates</h3>
      <h5>
        These templates accept the same set of data fields as your current selection and are renderable with
        that set.
      </h5>
      {relatedViews.map((view, idx) => (
        <TemplateCard key={idx} template={view} hideMatches={false} setEncodingMode={setEncodingMode} />
      ))}
    </div>
  );
}
interface RelatedViewsProps {
  columns: ColumnHeader[];
  setEncodingMode: GenericAction<string>;
  templateMap: TemplateMap;
  template: Template;
  templates: Template[];
}
export default function RelatedViews(props: RelatedViewsProps): JSX.Element {
  const {templates, templateMap, columns, template, setEncodingMode} = props;
  const viewsOfInterest = template.widgets
    .filter(x => targetTypes.has(x.type))
    .reduce((acc, widget) => {
      if (templateMap.paramValues[widget.name]) {
        return acc.concat(templateMap.paramValues[widget.name]);
      }
      return acc;
    }, [] as string[]);
  const relatedViews: Template[] = templates.filter(x => {
    // dont suggest the gallery or the current template
    if (x.templateName === GALLERY.templateName || x.templateName === template.templateName) {
      return false;
    }
    const {canBeUsed, isComplete} = searchDimensionsCanMatch(x, viewsOfInterest, columns);
    return canBeUsed && isComplete;
  });
  return (
    <div className="flex-down related-templates">
      <Tooltip
        placement="top"
        trigger="click"
        overlay={<PopoverContents relatedViews={relatedViews} setEncodingMode={setEncodingMode} />}
      >
        <div className="flex-down">
          <span>Related Templates</span>
          <span>
            {relatedViews.length} options
            <TiThLargeOutline />
          </span>
        </div>
      </Tooltip>
    </div>
  );
}
