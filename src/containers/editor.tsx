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
import EncodingColumn, {mapStateToProps as EncodingColumnMapStateToProps} from './encoding-column';
import HotKeyProvider, {mapStateToProps as HotKeyProviderMapStateToProps} from './hot-key-provider';
import DataColumn, {mapStateToProps as DataColumnMapStateToProps} from './data-column';
import TourProvider, {mapStateToProps as TourProviderMapStateToProps} from './tour-provider';

import {DataRow, ActionUser} from '../actions/index';
import {classnames} from '../utils';
import {getTemplate, getTemplateInstance, getTemplates} from '../utils/api';
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

// ensure that template instances with slashes are parsed right
function maybeAdjustTemplateInstanceFromParams(
  templateAuthor: string,
  templateName: string,
  templateInstance: string,
): string {
  const fullHref = window.location.href;
  const suburl = `${templateAuthor}/${templateName}/${templateInstance}`.trim();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [left, right] = fullHref.split(suburl);
  if (right && right.length) {
    return `${templateInstance.trim()}${right}`;
  } else {
    return templateInstance;
  }
}

function EditorContainer(props: RootProps): JSX.Element {
  const {languages, recieveTemplates} = props;
  const store = setUpState();
  const [repaintIdx, setRepaintIdx] = useState(0);
  const triggerRepaint = (): any => setRepaintIdx(repaintIdx + 1);
  const {templateAuthor, templateName, templateInstance, specialRoute} = useParams();
  const checkedTemplateInstance = maybeAdjustTemplateInstanceFromParams(
    templateAuthor,
    templateName,
    templateInstance,
  );

  useEffect(() => {
    props.setUserName(getUserName());
    props.recieveLanguages(props.languages);
    getTemplates().then((loadedTemplates) => recieveTemplates(loadedTemplates));
  }, []);

  // TODO MAINTAIN STATE ACROSS REFERENCE, ALSO TRY TO CONVERT SELECTION?
  useEffect(() => {
    if (
      (specialRoute === 'unpublished' || specialRoute === 'new') &&
      props.template.templateName !== '____loading____'
    ) {
      return;
    }
    if (!checkedTemplateInstance && !templateAuthor && !templateName) {
      if (!props.currentlySelectedFile) {
        props.setModalState('data');
      }
      props.setEncodingMode('Polestar');
      props.fillTemplateMapWithDefaults();
      return;
    }
    if (!checkedTemplateInstance) {
      getTemplate(templateAuthor, templateName).then((template) => {
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
        getTemplateInstance(templateAuthor, templateName, checkedTemplateInstance),
      ]).then(([template, templateInstance]) => {
        const dataset = templateInstance.dataset;
        props.changeSelectedFile({filename: dataset, dumpTemplateMap: false});
        props.setTemplate(template);
        props.setAllTemplateValues(templateInstance.template_instance as any as TemplateMap);
        props.setModalState(null);
      });
    }
  }, [templateAuthor, templateName, checkedTemplateInstance]);

  const width = getWidth() || 610;
  return (
    <div className="flex-down full-width full-height">
      <HotKeyProvider
        {...actionCreators}
        {...HotKeyProviderMapStateToProps(store.getState())}
        languages={languages}
      />
      <TourProvider {...actionCreators} {...TourProviderMapStateToProps(store.getState())} />
      {props.openModal === 'data' && (
        <DataModal
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
        activateTour={(): void => {
          props.setShowTour(true);
          if (!props.currentlySelectedFile) {
            props.loadDataFromPredefinedDatasets({filename: 'penguins.json', dumpTemplateMap: true});
          }
          props.setModalState(null);
        }}
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
                <DataColumn {...actionCreators} {...DataColumnMapStateToProps(store.getState())} />
                <EncodingColumn
                  {...actionCreators}
                  {...EncodingColumnMapStateToProps(store.getState())}
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
