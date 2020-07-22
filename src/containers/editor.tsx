import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';

import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';
import {GlobalHotKeys} from 'react-hotkeys';
import {useParams} from 'react-router-dom';

import GALLERY from '../templates/gallery';
import {getUserName} from '../utils/local-storage';

import {HOT_KEYS} from '../constants/index';
import * as actionCreators from '../actions/index';

import {DataRow, ActionUser} from '../actions/index';
import {getTemplateSaveState, computeValidAddNexts, classnames, log} from '../utils';
import {getTemplate, getTemplateInstance} from '../utils/api';
import {
  getHeight,
  getWidth,
  writeWidth,
  getEditorFontSize,
  writeEditorFontSize,
  getEditorLineWrap,
  writeEditorLineWrap,
} from '../utils/local-storage';
import {evaluateIvyProgram, getMissingFields} from '../ivy-lang';

import {Spec} from 'vega-typings';
import {
  AppState,
  ColumnHeader,
  DataReducerState,
  Json,
  LanguageExtension,
  Template,
  TemplateMap,
  ViewCatalog,
} from '../types';

import ChartArea from '../components/chart-area';
import CodeEditor from '../components/code-editor';
import DataColumn from '../components/data-column';
import DataModal from '../components/modals/data-modal';
import EncodingControls from '../components/encoding-controls';
import Header from '../components/header';
import ImportDataColumn from '../components/import-data-column';
import EncodingColumn from '../components/encoding-column';
import SplitPaneWrapper from '../components/split-pane';

interface RootProps extends ActionUser {
  canRedo: boolean;
  canUndo: boolean;
  codeMode: string;
  columns: ColumnHeader[];
  currentView: string;
  currentlySelectedFile: string;
  data: DataRow[];
  editMode: boolean;
  editorError: null | string;
  encodingMode: string;
  fillableFields: Set<string>;
  languages: {[x: string]: LanguageExtension};
  missingFields: string[];
  openModal: string | null;
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  spec: Spec;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templateSaveState: string;
  templates: Template[];
  userName: string;
  views: string[];
  viewCatalog: ViewCatalog;
}

function ChartAreaWrapper(props: RootProps, width: number): JSX.Element {
  return (
    <ChartArea
      chainActions={props.chainActions}
      changeViewName={props.changeViewName}
      cloneView={props.cloneView}
      columns={props.columns}
      createNewView={props.createNewView}
      currentView={props.currentView}
      data={props.data}
      deleteView={props.deleteView}
      editorError={props.editorError}
      encodingMode={props.encodingMode}
      languages={props.languages}
      missingFields={props.missingFields}
      saveCurrentTemplate={props.saveCurrentTemplate}
      setEncodingMode={props.setEncodingMode}
      setTemplateValue={props.setTemplateValue}
      setAllTemplateValues={props.setAllTemplateValues}
      setMaterialization={props.setMaterialization}
      setWidgetValue={props.setWidgetValue}
      spec={props.spec as Json}
      switchView={props.switchView}
      template={props.template}
      templateComplete={props.templateComplete}
      templateMap={props.templateMap}
      templates={props.templates}
      views={props.views}
      width={width}
    />
  );
}

function LeftColumn(props: RootProps): JSX.Element {
  const {columns, createFilter} = props;
  return (
    <div className="flex-down full-height column background-2">
      <ImportDataColumn
        currentlySelectedFile={props.currentlySelectedFile}
        setModalState={props.setModalState}
      />
      <DataColumn
        addToNextOpenSlot={props.addToNextOpenSlot}
        coerceType={props.coerceType}
        columns={columns}
        createFilter={createFilter}
        deleteFilter={props.deleteFilter}
        fillableFields={props.fillableFields}
        onDropFilter={(item: any): any => createFilter(columns.find(d => d.field === item.text))}
        showGUIView={props.showGUIView}
        template={props.template}
        templateMap={props.templateMap}
        updateFilter={props.updateFilter}
      />
    </div>
  );
}

function CenterColumn(props: RootProps): JSX.Element {
  return (
    <div className="full-height full-width flex-down" style={{minWidth: '360px'}}>
      <EncodingControls
        chainActions={props.chainActions}
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

function CodeEditorWrapper(props: RootProps, triggerRepaint: any): JSX.Element {
  return (
    <CodeEditor
      addWidget={props.addWidget}
      codeMode={props.codeMode}
      columns={props.columns}
      chainActions={props.chainActions}
      editMode={props.editMode}
      editorLineWrap={getEditorLineWrap()}
      editorError={props.editorError}
      editorFontSize={getEditorFontSize()}
      languages={props.languages}
      readInTemplate={props.readInTemplate}
      readInTemplateMap={props.readInTemplateMap}
      setCodeMode={props.setCodeMode}
      setEditMode={props.setEditMode}
      setSpecCode={props.setSpecCode}
      setEditorFontSize={(size: number): void => {
        writeEditorFontSize(size);
        triggerRepaint();
      }}
      setEditorLineWrap={(value: boolean): void => {
        writeEditorLineWrap(value);
        triggerRepaint();
      }}
      setAllTemplateValues={props.setAllTemplateValues}
      setProgrammaticView={props.setProgrammaticView}
      showProgrammaticMode={props.showProgrammaticMode}
      spec={props.spec}
      template={props.template}
      templateMap={props.templateMap}
    />
  );
}

function HotKeyProvider(props: RootProps): JSX.Element {
  const {
    canRedo,
    canUndo,
    editMode,
    fillTemplateMapWithDefaults,
    openModal,
    setEditMode,
    setModalState,
    template,
    triggerRedo,
    triggerUndo,
  } = props;
  const onGallery = template.templateName === GALLERY.templateName;
  const withSay = (func: any, name: string) => (): any => {
    log('hotkey', name);
    func();
  };
  return (
    <GlobalHotKeys
      keyMap={HOT_KEYS}
      handlers={{
        TOGGLE_EDIT: withSay(() => !onGallery && setEditMode(!editMode), 'edit'),
        CLEAR_ENCODING: withSay(() => fillTemplateMapWithDefaults(), 'clear'),
        UNDO: withSay(() => canUndo && triggerUndo(), 'undo'),
        REDO: withSay(() => canRedo && triggerRedo(), 'redo'),
        CLOSE_MODALS: withSay(() => {
          if (openModal) {
            setModalState(null);
          }
        }, 'close modals'),
      }}
      allowChanges={true}
    />
  );
}

function EditorContainer(props: RootProps): JSX.Element {
  const [repaintIdx, setRepaintIdx] = useState(0);
  const triggerRepaint = (): any => setRepaintIdx(repaintIdx + 1);
  const {templateAuthor, templateName, templateInstance, specialRoute} = useParams();
  useEffect(() => {
    props.setUserName(getUserName());
    props.recieveLanguages(props.languages);
  }, []);

  // TODO MAINTAIN STATE ACROSS REFERENCE, ALSO TRY TO CONVERT SELECTION?
  useEffect(() => {
    if (
      (specialRoute === 'unpublished' || specialRoute === 'new') &&
      props.template.templateName !== '____loading____'
    ) {
      return;
    }
    if (!templateInstance && !templateAuthor && !templateName) {
      if (!props.currentlySelectedFile) {
        props.setModalState('data');
      }
      props.setEncodingMode('Polestar');
      props.fillTemplateMapWithDefaults();
      return;
    }
    if (!templateInstance) {
      getTemplate(templateAuthor, templateName).then(template => {
        if (!props.currentlySelectedFile) {
          props.setModalState('data');
        }
        props.setTemplate(template);
      });
      return;
    }
    if (templateInstance) {
      Promise.all([
        getTemplate(templateAuthor, templateName),
        getTemplateInstance(templateAuthor, templateName, templateInstance),
      ]).then(([template, templateInstance]) => {
        const dataset = templateInstance.dataset;
        props.chainActions([
          (): any => props.changeSelectedFile({filename: dataset, dumpTemplateMap: false}),
          (): any => props.setTemplate(template),
          (): any =>
            props.setAllTemplateValues({
              paramValues: templateInstance.template_instance,
              systemValues: props.templateMap.systemValues,
            }),
        ]);
      });
    }
  }, [templateAuthor, templateName, templateInstance]);

  const width = getWidth() || 610;
  return (
    <div className="flex-down full-width full-height">
      {HotKeyProvider(props)}
      {props.openModal === 'data' && (
        <DataModal
          chainActions={props.chainActions}
          changeSelectedFile={props.changeSelectedFile}
          loadCustomDataset={props.loadCustomDataset}
          setModalState={props.setModalState}
        />
      )}
      <Header
        canRedo={props.canRedo}
        canUndo={props.canUndo}
        triggerRedo={props.triggerRedo}
        triggerUndo={props.triggerUndo}
      />
      <div className="flex main-content-container relative">
        <DndProvider backend={HTML5Backend}>
          <SplitPane
            split="vertical"
            minSize={610}
            style={{overflow: 'unset', position: 'relative'}}
            defaultSize={width}
            onChange={(x): void => {
              writeWidth(x);
              triggerRepaint();
            }}
          >
            <SplitPaneWrapper showProgrammaticMode={props.showProgrammaticMode} showGUIView={true}>
              <div
                className={classnames({
                  flex: true,
                  'full-height': true,
                  'full-width': true,
                  'special-bump-for-closed-code-container': !props.showProgrammaticMode,
                })}
              >
                {LeftColumn(props)}
                {CenterColumn(props)}
              </div>
              {CodeEditorWrapper(props, triggerRepaint)}
            </SplitPaneWrapper>
            {ChartAreaWrapper(props, width)}
          </SplitPane>
        </DndProvider>
      </div>
    </div>
  );
}

export function mapStateToProps({base, data}: {base: AppState; data: DataReducerState}): any {
  const template = base.currentTemplateInstance;
  const templateMap = base.templateMap;
  const missingFields = (template && getMissingFields(template, templateMap)) || [];
  const isGallery = template && GALLERY.templateName === template.templateName;
  const spec = evaluateIvyProgram(template, templateMap);
  return {
    canRedo: base.redoStack.length >= 1,
    canUndo: base.undoStack.length >= 1,
    codeMode: base.codeMode,
    columns: base.columns,
    currentView: base.currentView,
    currentlySelectedFile: base.currentlySelectedFile,
    data: data.data,
    editMode: isGallery ? false : base.editMode,
    editorError: base.editorError,
    encodingMode: base.encodingMode,
    fillableFields: computeValidAddNexts(template, templateMap),
    missingFields,
    openModal: base.openModal,
    showProgrammaticMode: isGallery ? false : base.showProgrammaticMode,
    showGUIView: base.showGUIView,
    spec,
    template,
    templateComplete: !missingFields.length,
    templateMap,
    templateSaveState: getTemplateSaveState(base),
    templates: base.templates,
    userName: base.userName,
    views: base.views,
    viewCatalog: base.viewCatalog,
  };
}

export default connect(mapStateToProps, actionCreators)(EditorContainer);
