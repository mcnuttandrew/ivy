import React from 'react';
import {ColumnHeader} from '../types';
import {GenericAction} from '../actions';
import {Template} from '../templates/types';
import {classnames} from '../utils';
import TemplateColumnAddNewWidgetPopover from './template-column-add-new-widget-popover';
import GeneralWidget from './widgets/general-widget';

interface TemplateColumnProps {
  editMode: boolean;
  templateMap: any;
  template: Template;
  columns: ColumnHeader[];
  setTemplateValue?: any;

  addWidget: GenericAction;
  removeWidget: GenericAction;
  setWidgetValue: GenericAction;
  moveWidget: GenericAction;
}

export default class TemplateColumn extends React.Component<
  TemplateColumnProps
> {
  render() {
    const {
      addWidget,
      columns,
      editMode,
      setTemplateValue,
      setWidgetValue,
      template,
      templateMap,
      removeWidget,
      moveWidget,
    } = this.props;

    return (
      <div className="full-height">
        {editMode && (
          <TemplateColumnAddNewWidgetPopover
            widgets={template.widgets}
            addWidget={addWidget}
          />
        )}
        <div
          className={classnames({
            column: true,
            'template-column': true,
            'edit-mode': editMode,
          })}
        >
          <div>
            {template.widgets.map((widget, idx) => {
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
                  removeWidget={() => removeWidget(idx)}
                  moveWidget={(fromIdx, toIdx) => moveWidget({fromIdx, toIdx})}
                  setWidgetValue={(key: string, value: any, idx: number) =>
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
