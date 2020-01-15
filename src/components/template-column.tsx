import React from 'react';
import {ColumnHeader} from '../types';
import {GenericAction} from '../actions';
import {Template, TemplateMap, TemplateWidget, WidgetValidationQuery} from '../templates/types';
import {classnames} from '../utils';
import TemplateColumnAddNewWidgetPopover from './template-column-add-new-widget-popover';
import GeneralWidget from './widgets/general-widget';

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

function evaluateQuery(query: WidgetValidationQuery, templateMap: TemplateMap): boolean {
  return Object.entries(query).every(([key, result]) => {
    if (result === null) {
      // console.log('null', typeof templateMap[key] !== 'number' && !templateMap[key]);
      return typeof templateMap[key] !== 'number' && !templateMap[key];
    }
    if (result === '*') {
      // console.log('star');
      return Boolean(templateMap[key]);
    }
    if (typeof result === 'string') {
      // console.log('set to');
      return templateMap[key] === result;
    }

    if (Array.isArray(result) && !Array.isArray(templateMap[key])) {
      // console.log('one of');
      return result.includes(templateMap[key] as string);
    }
    if (Array.isArray(result) && Array.isArray(templateMap[key])) {
      // console.log('equal to this collection');
      return JSON.stringify(result.sort()) === JSON.stringify((templateMap[key] as string[]).sort());
    }
    // console.log('none of above');
    return false;
  });
}

function applyQueries(template: Template, templateMap: TemplateMap): TemplateWidget<any>[] {
  const widgetMap = template.widgets.reduce((acc: any, widget) => {
    acc[widget.widgetName] = true;
    return acc;
  }, {});

  // asd test
  const validWidgetNames = template.widgetValidations.reduce((acc: {[x: string]: boolean}, validation) => {
    const queryResult = evaluateQuery(validation.query, templateMap);
    // i think this ternary might be wrong, double check
    acc[validation.queryTarget] = validation.queryResult === 'show' ? queryResult : !queryResult;
    return acc;
  }, widgetMap);
  return template.widgets.filter(widget => validWidgetNames[widget.widgetName]);
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
