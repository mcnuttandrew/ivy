import React from 'react';
import {IgnoreKeys} from 'react-hotkeys';
import {ColumnHeader} from '../types';
import {
  GenericAction,
  ModifyValueOnTemplatePayload,
  SetWidgetValuePayload,
  MoveWidgetPayload,
} from '../actions';
import {Template, GenWidget, TemplateMap} from '../templates/types';
import {classnames, toSet} from '../utils';

import GeneralWidget from './widgets/general-widget';
import {applyQueries} from '../hydra-lang';
import {updateThumbnail} from '../utils';
import {AddLabelToWidget} from './widgets/widget-common';
import Selector from './selector';
import Tooltip from 'rc-tooltip';
import {TiPlus} from 'react-icons/ti';
import {widgetFactory, preconfiguredWidgets, WidgetFactoryFunc} from '../templates';

interface EncodingColumnProps {
  columns: ColumnHeader[];
  editMode: boolean;
  setTemplateValue?: any;
  height?: number;
  template: Template;
  templateMap: TemplateMap;

  addWidget: GenericAction<GenWidget>;
  modifyValueOnTemplate: GenericAction<ModifyValueOnTemplatePayload>;
  removeWidget: GenericAction<number>;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  moveWidget: GenericAction<MoveWidgetPayload>;
}

interface AddWidgetButtonProps {
  addWidget: GenericAction<GenWidget>;
  widgets: GenWidget[];
}
function AddWidgetButton(props: AddWidgetButtonProps): JSX.Element {
  const {addWidget, widgets} = props;

  const renderOption = (row: [string, WidgetFactoryFunc]): JSX.Element => {
    const [key, widget] = row;
    // eslint-disable-next-line react/prop-types
    const newWidget = widget(widgets.length);
    return (
      <button key={key} onClick={(): any => addWidget(newWidget)}>
        Add {key}
      </button>
    );
  };
  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="add-widget-tooltip">
          <h3>Add New Widget</h3>
          <h5>Basic Types</h5>
          <div className="flex flex-wrap">{Object.entries(widgetFactory).map(renderOption)}</div>
          <h5>More complex</h5>
          <div className="flex flex-wrap">{Object.entries(preconfiguredWidgets).map(renderOption)}</div>
        </div>
      }
    >
      <button>
        Add Widget <TiPlus />
      </button>
    </Tooltip>
  );
}

function buildSections(template: Template): GenWidget[][] {
  const sections = template.widgets.reduce(
    (acc, widget) => {
      const type = widget.type;
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

export default class EncodingColumn extends React.Component<EncodingColumnProps> {
  render(): JSX.Element {
    const {
      addWidget,
      columns,
      editMode,
      height,
      modifyValueOnTemplate,
      setAllTemplateValues,
      setTemplateValue,
      setWidgetValue,
      template,
      templateMap,
      removeWidget,
      moveWidget,
    } = this.props;
    // TODO, this should maybe move off of the main path?
    const allowedWidgets = toSet(applyQueries(template, templateMap));
    const makeWidget = (widget: GenWidget, idx: number): JSX.Element => (
      <GeneralWidget
        allowedWidgets={allowedWidgets}
        code={template.code}
        columns={columns}
        editMode={editMode}
        idx={idx}
        key={idx}
        moveWidget={(fromIdx, toIdx): any => moveWidget({fromIdx, toIdx})}
        removeWidget={(): any => removeWidget(idx)}
        setAllTemplateValues={setAllTemplateValues}
        setTemplateValue={setTemplateValue}
        setWidgetValue={(key: string, value: any, idx: number): any => setWidgetValue({key, value, idx})}
        templateMap={templateMap}
        template={template}
        widget={widget}
      />
    );

    let idx = -1;
    const sectionedWidgets = buildSections(template).map((section, jdx) => {
      if (!section.length) {
        return null;
      }
      const inBlankSection = section[0].type === 'Section';
      const sectionContents = section.map((widget: GenWidget, kdx) => {
        // the index is essential to maintain in order to make sure the updates happen correctly
        idx += 1;
        if (!editMode && !allowedWidgets.has(widget.name)) {
          return null;
        }
        return (
          <div
            className={classnames({
              'pad-widget': kdx && !inBlankSection,
              [`${widget.type}-widget-type`]: true,
            })}
            key={`widget-${idx}`}
          >
            {makeWidget(widget, idx)}
          </div>
        );
      });
      if (!sectionContents.filter(d => d).length) {
        return null;
      }
      return (
        <div
          className={classnames({
            'widget-section': true,
            'blank-section': inBlankSection,
            'widget-section--editing': editMode,
          })}
          key={`section-${jdx}`}
        >
          {sectionContents}
        </div>
      );
    });
    return (
      <div className="full-height encoding-column" style={(height && {maxHeight: height}) || {}}>
        {editMode && template && (
          <div className="flex">
            <div className="flex full-width space-between">
              <IgnoreKeys style={{height: '100%'}}>
                <AddLabelToWidget label={'Name'}>
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
                </AddLabelToWidget>
                <AddLabelToWidget label={'Description'}>
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
                </AddLabelToWidget>
              </IgnoreKeys>
              <AddLabelToWidget label={'Template Language'}>
                <Selector
                  options={['vega-lite', 'vega', 'unit-vis', 'hydra-data-table'].map(key => ({
                    display: key,
                    value: key,
                  }))}
                  selectedValue={template.templateLanguage}
                  onChange={(value: any): any =>
                    modifyValueOnTemplate({
                      value,
                      key: 'templateLanguage',
                    })
                  }
                />
              </AddLabelToWidget>
            </div>
          </div>
        )}
        {editMode && (
          <div className="flex">
            <AddWidgetButton widgets={template.widgets} addWidget={addWidget} />
            <button onClick={(): any => updateThumbnail(template.templateName, template.templateAuthor)}>
              Update Thumbnail
            </button>
          </div>
        )}
        <div className={classnames({'template-column': true, 'edit-mode': editMode})}>{sectionedWidgets}</div>
      </div>
    );
  }
}
