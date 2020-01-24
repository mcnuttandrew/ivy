import React from 'react';

import {ColumnHeader} from '../types';
import {GenericAction} from '../actions';
import {Template, TemplateWidget, WidgetSubType, TemplateMap} from '../templates/types';
import {classnames} from '../utils';
import TemplateColumnAddNewWidgetPopover from './template-column-add-new-widget-popover';
import GeneralWidget from './widgets/general-widget';
import {applyQueries} from '../hydra-lang';
import {updateThumbnail} from '../thumbnail';

interface TemplateColumnProps {
  columns: ColumnHeader[];
  editMode: boolean;
  setTemplateValue?: any;
  showSimpleDisplay: boolean;
  template: Template;
  templateMap: TemplateMap;

  addWidget: GenericAction;
  modifyValueOnTemplate: GenericAction;
  removeWidget: GenericAction;
  setWidgetValue: GenericAction;
  moveWidget: GenericAction;
}

function buildSections(template: Template): TemplateWidget<WidgetSubType>[][] {
  const sections = template.widgets.reduce(
    (acc, widget) => {
      const type = widget.widgetType;
      if (type === 'DataTarget' || type === 'MultiDataTarget' || type === 'Section') {
        return {
          currentSection: [widget],
          sections: acc.sections.concat([acc.currentSection]),
        };
      }

      return {
        currentSection: acc.currentSection.concat(widget),
        sections: acc.sections,
      };
    },
    {currentSection: [], sections: []},
  );

  return sections.sections.filter(d => d.length).concat([sections.currentSection]);
}

const toSet = (widgets: TemplateWidget<WidgetSubType>[]): Set<string> =>
  widgets.reduce((acc, row) => acc.add(row.widgetName), new Set() as Set<string>);

export default class TemplateColumn extends React.Component<TemplateColumnProps> {
  render(): JSX.Element {
    const {
      addWidget,
      columns,
      editMode,
      modifyValueOnTemplate,
      setTemplateValue,
      setWidgetValue,
      showSimpleDisplay,
      template,
      templateMap,
      removeWidget,
      moveWidget,
    } = this.props;
    // TODO, this should maybe move off of the main path?
    const allowedWidgets = toSet(applyQueries(template, templateMap));
    const makeWidget = (widget: TemplateWidget<WidgetSubType>, idx: number): JSX.Element => (
      <GeneralWidget
        code={template.code}
        columns={columns}
        editMode={editMode}
        idx={idx}
        moveWidget={(fromIdx, toIdx): any => moveWidget({fromIdx, toIdx})}
        removeWidget={(): any => removeWidget(idx)}
        setTemplateValue={setTemplateValue}
        setWidgetValue={(key: string, value: any, idx: number): any => setWidgetValue({key, value, idx})}
        showSimpleDisplay={showSimpleDisplay}
        templateMap={templateMap}
        widget={widget}
      />
    );

    let idx = -1;
    const sectionedWidgets = buildSections(template).map((section, jdx) => {
      if (!section.length) {
        return null;
      }
      const inBlankSection = section[0].widgetType === 'Section';
      return (
        <div
          className={classnames({
            'widget-section': true,
            'blank-section': inBlankSection,
          })}
          key={`section-${jdx}`}
        >
          {section.map((widget: TemplateWidget<WidgetSubType>, kdx) => {
            // the index is essential to maintain in order to make sure the updates happen correctly
            idx += 1;
            if (!allowedWidgets.has(widget.widgetName)) {
              return null;
            }
            return (
              <div
                className={classnames({
                  'pad-widget': kdx && !inBlankSection,
                })}
                key={`widget-${idx}`}
              >
                {makeWidget(widget, idx)}
              </div>
            );
          })}
        </div>
      );
    });
    return (
      <div className="full-height encoding-column">
        {showSimpleDisplay && (
          <div>
            <h3>{template.templateName}</h3>
          </div>
        )}
        {editMode && template && (
          <div className="flex">
            <div className="flex-down">
              <div className="flex">
                <h1 className="section-title">NAME:</h1>
                <input
                  type="text"
                  value={template.templateName}
                  onChange={(event): any =>
                    modifyValueOnTemplate({
                      value: event.target.value,
                      key: 'templateName',
                    })
                  }
                />
              </div>
              <div className="flex">
                <h1 className="section-title">Description:</h1>
                <input
                  type="text"
                  value={template.templateDescription}
                  onChange={(event): any =>
                    modifyValueOnTemplate({
                      value: event.target.value,
                      key: 'templateDescription',
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
        {editMode && (
          <div className="flex">
            <TemplateColumnAddNewWidgetPopover widgets={template.widgets} addWidget={addWidget} />
            <button
              onClick={(): any =>
                updateThumbnail(template.templateName).then(() =>
                  console.log('image update, todo trigger something'),
                )
              }
            >
              Update Thumbnail
            </button>
          </div>
        )}
        <div
          className={classnames({
            'template-column': true,
            'edit-mode': editMode,
          })}
        >
          {!editMode && sectionedWidgets}
          {editMode && template.widgets.map(makeWidget)}
        </div>
      </div>
    );
  }
}
