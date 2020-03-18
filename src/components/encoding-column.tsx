import React, {useState, useEffect} from 'react';
import {IgnoreKeys} from 'react-hotkeys';
import Switch from 'react-switch';
import {
  GenericAction,
  ModifyValueOnTemplatePayload,
  SetWidgetValuePayload,
  MoveWidgetPayload,
} from '../actions';
import {
  Template,
  GenWidget,
  TemplateMap,
  LanguageExtension,
  ViewsToMaterialize,
  ColumnHeader,
} from '../types';
import {classnames, toSet} from '../utils';
import {switchCommon} from '../constants';

import GeneralWidget from './widgets/general-widget';
import {applyQueries} from '../ivy-lang';
import {updateThumbnail} from '../utils';
import {AddLabelToWidget, Reset} from './widgets/widget-common';
import Selector from './selector';
import Tooltip from 'rc-tooltip';
import {TiPlus, TiChevronRight} from 'react-icons/ti';
import {widgetFactoryByGroups, preconfiguredWidgets, WidgetFactoryFunc} from '../templates';
import {getWidgetTemplates, setWidgetTemplates} from '../utils/local-storage';

interface EncodingColumnProps {
  addWidget: GenericAction<GenWidget>;
  columns: ColumnHeader[];
  duplicateWidget: GenericAction<number>;
  editMode: boolean;
  height?: number;
  languages: {[x: string]: LanguageExtension};
  modifyValueOnTemplate: GenericAction<ModifyValueOnTemplatePayload>;
  moveWidget: GenericAction<MoveWidgetPayload>;
  removeWidget: GenericAction<number>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setTemplateValue?: any;
  setWidgetValue: GenericAction<SetWidgetValuePayload>;
  template: Template;
  templateMap: TemplateMap;
}

interface AddWidgetButtonProps {
  addWidget: GenericAction<GenWidget>;
  widgets: GenWidget[];
  widgetTemplates: GenWidget[];
  removeWidgetFromTemplates: (widget: GenWidget) => void;
}

const renderOption = (
  widgets: GenWidget[],
  addWidget: GenericAction<GenWidget>,
  removeWidgetFromTemplates?: (widget: GenWidget) => void,
) => ([key, widgetFactory]: [string, WidgetFactoryFunc]): JSX.Element => {
  const newWidget = widgetFactory(widgets.length);
  return (
    <div key={key} className="cursor-pointer flex add-widget-row space-between">
      <div onClick={(): any => addWidget(newWidget)}>
        <TiChevronRight />
        <span>New {key}</span>
      </div>
      {removeWidgetFromTemplates && (
        <Reset
          className="margin-left"
          tooltipLabel="Delete this saved template from the local cache"
          onClick={(): any => removeWidgetFromTemplates({...newWidget, name: key})}
        />
      )}
    </div>
  );
};

function AddWidgetButton(props: AddWidgetButtonProps): JSX.Element {
  const {addWidget, widgets, widgetTemplates, removeWidgetFromTemplates} = props;

  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <div className="add-widget-tooltip">
          <h1>Add New Widget</h1>
          {Object.entries(widgetFactoryByGroups).map(([group, obj]) => {
            return (
              <React.Fragment key={group}>
                <h5>{group}</h5>
                {Object.entries(obj).map(renderOption(widgets, addWidget))}
              </React.Fragment>
            );
          })}
          <h3>More Specific</h3>
          <div className="flex flex-wrap">
            {Object.entries(preconfiguredWidgets).map(renderOption(widgets, addWidget))}
          </div>
          <h3>User Defined</h3>
          <div className="flex flex-wrap">
            {widgetTemplates.length ? (
              widgetTemplates
                .map(widget => {
                  const factory = (idx: number): GenWidget => ({...widget, name: `${widget.name}-${idx}`});
                  return [widget.name, factory];
                })
                .map(renderOption(widgets, addWidget, removeWidgetFromTemplates))
            ) : (
              <p>Save widgets for future use</p>
            )}
          </div>
        </div>
      }
    >
      <button type="button">
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

export default function EncodingColumn(props: EncodingColumnProps): JSX.Element {
  const {
    addWidget,
    columns,
    duplicateWidget,
    editMode,
    height,
    languages,
    modifyValueOnTemplate,
    moveWidget,
    removeWidget,
    setAllTemplateValues,
    setMaterialization,
    setTemplateValue,
    setWidgetValue,
    template,
    templateMap,
  } = props;
  // cache the query validations
  const [allowedWidgets, setWidgets] = useState(new Set() as Set<string>);
  useEffect(() => {
    setWidgets(toSet(applyQueries(template, templateMap)));
  }, [template, templateMap]);

  // cache and get the template widgets
  const [widgetTemplates, setWidgetTemplatesState] = useState([]);
  useEffect(() => {
    getWidgetTemplates().then(d => setWidgetTemplatesState(d || []));
  }, []);
  const updateTemplateWidgets = (addToTail: boolean) => (widget: GenWidget): void => {
    const updatedWidgets = widgetTemplates
      .filter(d => {
        console.log(d.name, widget.name);
        return d.name !== widget.name;
      })
      .concat(addToTail ? widget : []);
    console.log(updatedWidgets, widget.name, addToTail);
    setWidgetTemplates(updatedWidgets);
    setWidgetTemplatesState(updatedWidgets);
  };
  const saveWidgetAsTemplate = updateTemplateWidgets(true);
  const removeWidgetFromTemplates = updateTemplateWidgets(false);

  const makeWidget = (widget: GenWidget, idx: number): JSX.Element => (
    <GeneralWidget
      allowedWidgets={allowedWidgets}
      // eslint-disable-next-line react/prop-types
      code={template.code}
      columns={columns}
      editMode={editMode}
      idx={idx}
      key={idx}
      moveWidget={(fromIdx, toIdx): any => moveWidget({fromIdx, toIdx})}
      removeWidget={(): any => removeWidget(idx)}
      duplicateWidget={(): any => duplicateWidget(idx)}
      setAllTemplateValues={setAllTemplateValues}
      setTemplateValue={setTemplateValue}
      setWidgetValue={(key: string, value: any, idx: number): any => setWidgetValue({key, value, idx})}
      templateMap={templateMap}
      template={template}
      setMaterialization={setMaterialization}
      saveWidgetAsTemplate={saveWidgetAsTemplate}
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
                  aria-label="Template Name"
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
                  aria-label="Template Description"
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
            <div className="flex-down">
              <AddLabelToWidget label={'Template Language'}>
                <Selector
                  options={Object.keys(languages).map(key => ({
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
              <AddLabelToWidget label={'Disallow Fan Out'}>
                <Switch
                  {...switchCommon}
                  checked={!!template.disallowFanOut}
                  onChange={(): any =>
                    modifyValueOnTemplate({
                      value: !template.disallowFanOut,
                      key: 'disallowFanOut',
                    })
                  }
                />
              </AddLabelToWidget>
            </div>
          </div>
        </div>
      )}
      {editMode && (
        <div className="flex encoding-control-buttons">
          <AddWidgetButton
            widgets={template.widgets}
            addWidget={addWidget}
            widgetTemplates={widgetTemplates}
            removeWidgetFromTemplates={removeWidgetFromTemplates}
          />
          <button onClick={(): any => updateThumbnail(template.templateName, template.templateAuthor)}>
            Update Thumbnail
          </button>
        </div>
      )}
      <div className={classnames({'template-column': true, 'edit-mode': editMode})}>{sectionedWidgets}</div>
    </div>
  );
}
