import React from 'react';
import {GenericAction} from '../actions/index';
import Tooltip from 'rc-tooltip';

import GALLERY from '../templates/gallery';
import {ColumnHeader, Template, TemplateMap} from '../types';
import {searchDimensionsCanMatch} from '../utils';
import ProgramPreview from './program-preview';
import {TiThLargeOutline} from 'react-icons/ti';

const targetTypes = new Set(['DataTarget', 'MultiDataTarget']);
interface PopoverContentsProps {
  relatedViews: Template[];
  setEncodingMode: GenericAction<string>;
  userName: string;
}
function PopoverContents(props: PopoverContentsProps): JSX.Element {
  const {relatedViews, setEncodingMode, userName} = props;
  return (
    <div className="related-templates-popover">
      <h3>Related Templates</h3>
      <h5>
        These templates accepted the same set of data fields as your current selection and are renderable with
        that set
      </h5>
      {relatedViews.map((view, idx) => {
        return (
          <ProgramPreview
            key={idx}
            template={view}
            setEncodingMode={setEncodingMode}
            buttons={[]}
            userName={userName}
          />
        );
      })}
    </div>
  );
}
interface RelatedViewsProps {
  columns: ColumnHeader[];
  setEncodingMode: GenericAction<string>;
  templateMap: TemplateMap;
  template: Template;
  templates: Template[];
  userName: string;
}
export default function RelatedViews(props: RelatedViewsProps): JSX.Element {
  const {templates, templateMap, columns, template, setEncodingMode, userName} = props;
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
        overlay={
          <PopoverContents
            relatedViews={relatedViews}
            setEncodingMode={setEncodingMode}
            userName={userName}
          />
        }
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
