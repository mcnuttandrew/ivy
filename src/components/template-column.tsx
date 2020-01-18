import React from 'react';

import {ColumnHeader} from '../types';
import {GenericAction} from '../actions';
import {Template, TemplateMap} from '../templates/types';
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
    const widgets = applyQueries(template, templateMap);
    return (
      <div className="full-height encoding-column">
        {showSimpleDisplay && (
          <div>
            <h3>{template.templateName}</h3>
          </div>
        )}
        {editMode && (
          <div className="flex">
            <div className="flex-down">
              {template && (
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
              )}
              {/* {!editMode && (
                <h3>{template ? template.templateDescription : 'Tableau-style grammar of graphics'}</h3>
              )} */}
              {template && (
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
              )}
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
          <div>
            {widgets.map((widget, idx) => {
              return (
                <GeneralWidget
                  templateMap={templateMap}
                  setTemplateValue={setTemplateValue}
                  editMode={editMode}
                  columns={columns}
                  code={template.code}
                  widget={widget}
                  idx={idx}
                  key={`${idx}`}
                  showSimpleDisplay={showSimpleDisplay}
                  removeWidget={(): any => removeWidget(idx)}
                  moveWidget={(fromIdx, toIdx): any => moveWidget({fromIdx, toIdx})}
                  setWidgetValue={(key: string, value: any, idx: number): any =>
                    setWidgetValue({key, value, idx})
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
