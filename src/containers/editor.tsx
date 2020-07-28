import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {fakeSetupState as setUpState} from '../reducers/index';

import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SplitPane from 'react-split-pane';
import {useParams} from 'react-router-dom';

import GALLERY from '../templates/gallery';
import {getUserName} from '../utils/local-storage';

import * as actionCreators from '../actions/index';

import ChartAreaContainer, {mapStateToProps as ChartAreaMapStateToProps} from './chart-container';
import CodeEditor, {mapStateToProps as CodeEditorMapStateToProps} from './code-editor';
import CenterColumn, {mapStateToProps as CenterColumnMapStateToProps} from './encoding-column';
import HotKeyProvider, {mapStateToProps as HotKeyProviderMapStateToProps} from './hot-key-provider';
import LeftColumn, {mapStateToProps as LeftColumnMapStateToProps} from './data-column';

import {DataRow, ActionUser} from '../actions/index';
import {classnames} from '../utils';
import {getTemplate, getTemplateInstance} from '../utils/api';
import {getWidth, writeWidth} from '../utils/local-storage';
import {AppState, DataReducerState, LanguageExtension, Template, TemplateMap} from '../types';

import DataModal from '../components/modals/data-modal';
import UserModal from '../components/modals/user-modal';

import Header from '../components/header';
import SplitPaneWrapper from '../components/split-pane';

interface RootProps extends ActionUser {
  canRedo: boolean;
  canUndo: boolean;
  currentlySelectedFile: string;
  data: DataRow[];
  encodingMode: string;
  languages: {[x: string]: LanguageExtension};
  openModal: string | null;
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  template: Template;
  templateMap: TemplateMap;
  userName: string;
}

function EditorContainer(props: RootProps): JSX.Element {
  const {languages} = props;
  const store = setUpState();
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
          (): any => props.setAllTemplateValues((templateInstance.template_instance as any) as TemplateMap),
        ]);
      });
    }
  }, [templateAuthor, templateName, templateInstance]);

  const width = getWidth() || 610;
  return (
    <div className="flex-down full-width full-height">
      <HotKeyProvider
        {...actionCreators}
        {...HotKeyProviderMapStateToProps(store.getState())}
        languages={languages}
      />
      {props.openModal === 'data' && (
        <DataModal
          chainActions={props.chainActions}
          changeSelectedFile={props.changeSelectedFile}
          loadCustomDataset={props.loadCustomDataset}
          setModalState={props.setModalState}
        />
      )}
      {props.openModal === 'user' && (
        <UserModal
          setModalState={props.setModalState}
          userName={props.userName}
          setUserName={props.setUserName}
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
                <LeftColumn
                  {...actionCreators}
                  {...LeftColumnMapStateToProps(store.getState())}
                  languages={languages}
                />
                <CenterColumn
                  {...actionCreators}
                  {...CenterColumnMapStateToProps(store.getState())}
                  languages={languages}
                />
              </div>
              <CodeEditor
                {...actionCreators}
                {...CodeEditorMapStateToProps(store.getState())}
                languages={languages}
                triggerRepaint={triggerRepaint}
              />
            </SplitPaneWrapper>
            <ChartAreaContainer
              {...actionCreators}
              {...ChartAreaMapStateToProps(store.getState())}
              languages={languages}
              width={width}
            />
          </SplitPane>
        </DndProvider>
      </div>
    </div>
  );
}

export function mapStateToProps({base, data}: {base: AppState; data: DataReducerState}): any {
  const template = base.currentTemplateInstance;
  const isGallery = template && GALLERY.templateName === template.templateName;
  return {
    canRedo: base.redoStack.length >= 1,
    canUndo: base.undoStack.length >= 1,
    currentlySelectedFile: base.currentlySelectedFile,
    data: data.data,
    openModal: base.openModal,
    showProgrammaticMode: isGallery ? false : base.showProgrammaticMode,
    showGUIView: base.showGUIView,
    template,
    userName: base.userName,
  };
}

export default connect(mapStateToProps, actionCreators)(EditorContainer);
