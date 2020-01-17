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
      setTemplateValue,
      setWidgetValue,
      showSimpleDisplay,
      template,
      templateMap,
      removeWidget,
      moveWidget,
    } = this.props;
    const widgets = applyQueries(template, templateMap);
    console.log(widgets, template.widgetValidations);
    return (
      <div className="full-height encoding-column">
        {showSimpleDisplay && (
          <div>
            <h3>{template.templateName}</h3>
          </div>
        )}
        {editMode && <TemplateColumnAddNewWidgetPopover widgets={template.widgets} addWidget={addWidget} />}
        {editMode && (
          <button
            onClick={(): any =>
              updateThumbnail(template.templateName).then(() =>
                console.log('image update, todo trigger something'),
              )
            }
          >
            Update Thumbnail
          </button>
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
