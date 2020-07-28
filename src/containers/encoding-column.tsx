import React from 'react';
import {connect} from 'react-redux';

import GALLERY from '../templates/gallery';
import * as actionCreators from '../actions/index';

import {ActionUser} from '../actions/index';
import {getTemplateSaveState, classnames} from '../utils';
import {getHeight} from '../utils/local-storage';

import {AppState, ColumnHeader, LanguageExtension, Template, TemplateMap} from '../types';

import EncodingControls from '../components/encoding-controls';
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
  return (
    <div className="full-height full-width flex-down" style={{minWidth: '360px'}}>
      <EncodingControls
        currentlySelectedFile={props.currentlySelectedFile}
        deleteTemplate={props.deleteTemplate}
        editMode={props.editMode}
        encodingMode={props.encodingMode}
        fillTemplateMapWithDefaults={props.fillTemplateMapWithDefaults}
        languages={props.languages}
        modifyValueOnTemplate={props.modifyValueOnTemplate}
        saveCurrentTemplate={props.saveCurrentTemplate}
        setBlankTemplate={props.setBlankTemplate}
        setCodeMode={props.setCodeMode}
        setEditMode={props.setEditMode}
        setProgrammaticView={props.setProgrammaticView}
        template={props.template}
        templateMap={props.templateMap}
        templateSaveState={props.templateSaveState}
        templates={props.templates}
        userName={props.userName}
      />

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
