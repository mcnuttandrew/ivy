import React from 'react';
import {connect} from 'react-redux';

import GALLERY from '../templates/gallery';
import * as actionCreators from '../actions/index';

import {ActionUser} from '../actions/index';
import {getTemplateSaveState, classnames} from '../utils';
import {getHeight} from '../utils/local-storage';

import {AppState, ColumnHeader, LanguageExtension, Template, TemplateMap} from '../types';
import {getTemplateName} from '../utils';
import PublishInstanceTooltip from '../components/tooltips/publish-instance-tooltip';
import PublishTemplateTooltip from '../components/tooltips/publish-template-tooltip';
import UnpublishTemplateTooltip from '../components/tooltips/unpublish-template-tooltip';
import ForkStateTooltip from '../components/tooltips/fork-state-tooltip';
import NewTemplateTooltip from '../components/tooltips/new-template-tooltip';
import ResetTemplateMapTooltip from '../components/tooltips/reset-template-map-tooltip';
import EncodingColumn from '../components/encoding-column';

interface RootProps extends ActionUser {
  columns: ColumnHeader[];
  currentlySelectedFile: string;
  editMode: boolean;
  encodingMode: string;
  languages: {[x: string]: LanguageExtension};
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  template: Template;
  templateMap: TemplateMap;
  templateSaveState: string;
  templates: Template[];
  userName: string;
}

function CenterColumn(props: RootProps): JSX.Element {
  const {
    currentlySelectedFile,
    fillTemplateMapWithDefaults,
    deleteTemplate,
    languages,
    saveCurrentTemplate,
    setBlankTemplate,
    setCodeMode,
    setEditMode,
    setProgrammaticView,
    template,
    templateMap,
    templateSaveState,
    userName,
  } = props;
  const onGallery = template.templateName === GALLERY.templateName;
  return (
    <div
      className="full-height full-width flex-down"
      style={{minWidth: '360px'}}
      id="encoding-column-container"
    >
      <div className="template-logo">
        <div className="flex-down full-width">
          <h4>
            <b>Template:</b> {getTemplateName(template)}
          </h4>
          <h5 className="flex">
            <b>Description: </b>
            {template.templateDescription}
          </h5>
          <h5 className="flex">
            <b>Author: </b>
            {template.templateAuthor}
          </h5>
          <div className="template-actions flex-down">
            <div className="flex full-width flex-wrap">
              <h5>
                <b>Actions: </b>
              </h5>

              <NewTemplateTooltip
                setBlankTemplate={setBlankTemplate}
                setEditMode={setEditMode}
                languages={languages}
                setCodeMode={setCodeMode}
                setProgrammaticView={setProgrammaticView}
              />
              {!onGallery && (
                <ForkStateTooltip
                  setBlankTemplate={setBlankTemplate}
                  setEditMode={setEditMode}
                  template={template}
                />
              )}

              <ResetTemplateMapTooltip fillTemplateMapWithDefaults={fillTemplateMapWithDefaults} />
              <PublishInstanceTooltip
                templateAuthor={template.templateAuthor}
                templateName={template.templateName}
                templateMap={templateMap}
                dataset={currentlySelectedFile}
                userName={userName}
              />
              {userName === template.templateAuthor && (
                <UnpublishTemplateTooltip
                  template={template}
                  deleteTemplate={deleteTemplate}
                  userName={userName}
                />
              )}
            </div>
          </div>
          {templateSaveState !== 'EQUAL' && (
            <h5>
              <span>Unsaved changes: </span>
              {userName === template.templateAuthor ? (
                <PublishTemplateTooltip template={template} saveCurrentTemplate={saveCurrentTemplate} />
              ) : (
                <span>fork and save to publish</span>
              )}
            </h5>
          )}
        </div>
      </div>

      <div className="edit-view-toggle">
        {['Edit', 'View'].map((label, idx) => {
          return (
            <div
              key={label}
              className={classnames({
                'edit-view-toggle-option': true,
                'selected-edit-view-toggle-option': idx ? !props.editMode : props.editMode,
              })}
              onClick={(): any => props.setEditMode(!idx)}
            >
              {label}
            </div>
          );
        })}
      </div>

      <EncodingColumn
        addWidget={props.addWidget}
        columns={props.columns}
        duplicateWidget={props.duplicateWidget}
        editMode={props.editMode}
        height={props.showProgrammaticMode && props.showGUIView && getHeight()}
        languages={props.languages}
        modifyValueOnTemplate={props.modifyValueOnTemplate}
        moveWidget={props.moveWidget}
        removeWidget={props.removeWidget}
        setAllTemplateValues={props.setAllTemplateValues}
        setMaterialization={props.setMaterialization}
        setTemplateValue={props.setTemplateValue}
        setWidgetValue={props.setWidgetValue}
        template={props.template}
        templateMap={props.templateMap}
      />
    </div>
  );
}

export function mapStateToProps({base}: {base: AppState}): any {
  const template = base.currentTemplateInstance;
  const templateMap = base.templateMap;
  const isGallery = template && GALLERY.templateName === template.templateName;
  return {
    columns: base.columns,
    currentlySelectedFile: base.currentlySelectedFile,
    editMode: isGallery ? false : base.editMode,
    encodingMode: base.encodingMode,
    showProgrammaticMode: isGallery ? false : base.showProgrammaticMode,
    showGUIView: base.showGUIView,
    template,
    templateMap,
    templateSaveState: getTemplateSaveState(base),
    templates: base.templates,
    userName: base.userName,
  };
}

export default connect(mapStateToProps, actionCreators)(CenterColumn);
