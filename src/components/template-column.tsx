import React from 'react';
import {ColumnHeader} from '../types';
import {GenericAction} from '../actions';
import {Template} from '../templates/types';
import {classnames} from '../utils';
import NewWidgetMenu from './new-widget-menu';
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
    } = this.props;

    return (
      <div>
        <NewWidgetMenu widgets={template.widgets} addWidget={addWidget} />
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
                  incrementOrder={() => {
                    if (idx === template.widgets.length - 1) {
                      return;
                    }
                    {
                      /* this.setState({
                    widgets: widgets
                      .set(idx + 1, widget)
                      .set(idx, widgets.get(idx + 1)),
                  }); */
                    }
                  }}
                  decrementOrder={() => {
                    if (idx === 0) {
                      return;
                    }
                    {
                      /* this.setState({
                    widgets: widgets
                      .set(idx - 1, widget)
                      .set(idx, widgets.get(idx - 1)),
                  }); */
                    }
                  }}
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
