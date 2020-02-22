import React from 'react';
import {Template, ColumnHeader, Json, HydraExtension, ViewsToMaterialize, TemplateMap} from '../types';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog, TiDocumentAdd} from 'react-icons/ti';
import {IgnoreKeys} from 'react-hotkeys';
import {GenericAction, DataRow} from '../actions';
import DataSearchMode from './gallery';
import GALLERY from '../templates/gallery';
import {evaluateHydraProgram} from '../hydra-lang';

interface ChartAreaProps {
  cloneView: GenericAction<void>;
  createNewView: GenericAction<void>;
  changeViewName: GenericAction<{idx: number; value: string}>;
  columns: ColumnHeader[];
  currentView: string;
  data: DataRow[];
  deleteView: GenericAction<string>;
  deleteTemplate: GenericAction<string>;
  encodingMode: string;
  languages: {[x: string]: HydraExtension};
  missingFields: string[];
  setEncodingMode: GenericAction<string>;
  spec: Json;
  switchView: GenericAction<string>;
  template: Template;
  templateMap: TemplateMap;
  templates: Template[];
  templateComplete: boolean;
  views: string[];
  viewsToMaterialize: ViewsToMaterialize;
}

interface NewViewProps {
  createNewView: GenericAction<void>;
  cloneView: GenericAction<void>;
}

function newViewButton(props: NewViewProps): JSX.Element {
  const {createNewView, cloneView} = props;
  return (
    <Tooltip
      placement="bottom"
      trigger="click"
      overlay={
        <span className="flex-down">
          <div className="flex">
            <button onClick={(): any => createNewView()}>NEW</button>
            <span>Create a new view from the initial selection.</span>
          </div>
          <div className="flex">
            <button onClick={(): any => cloneView()}>CLONE</button>
            <span>Clone the current view into a new view.</span>
          </div>
        </span>
      }
    >
      <div className="view-control">
        <TiDocumentAdd />
      </div>
    </Tooltip>
  );
}

interface ViewOptionProps {
  changeViewName: GenericAction<{idx: number; value: string}>;
  currentView: string;
  deleteView: GenericAction<string>;
  idx: number;
  switchView: GenericAction<string>;
  view: string;
}

function viewOption(props: ViewOptionProps): JSX.Element {
  const {idx, view, currentView, changeViewName, switchView, deleteView} = props;
  return (
    <div
      key={idx}
      className={classnames({
        'view-control': true,
        selected: view === currentView,
      })}
      onClick={(): any => switchView(view)}
    >
      <button>{view}</button>
      <Tooltip
        placement="bottom"
        trigger="click"
        overlay={
          <div>
            <div>View Controls</div>
            <IgnoreKeys style={{height: '100%'}}>
              <input
                value={view}
                type="text"
                onChange={(e): any => changeViewName({idx, value: e.target.value})}
              />
            </IgnoreKeys>
            <button onClick={(): any => deleteView(view)}>delete view</button>
          </div>
        }
      >
        <span className="view-settings">
          <TiCog />
        </span>
      </Tooltip>
    </div>
  );
}

// TODO memoize the rendering stuff
export default function ChartArea(props: ChartAreaProps): JSX.Element {
  const {
    changeViewName,
    cloneView,
    columns,
    createNewView,
    currentView,
    data,
    deleteView,
    deleteTemplate,
    encodingMode,
    languages,
    missingFields,
    setEncodingMode,
    spec,
    switchView,
    template,
    templateComplete,
    viewsToMaterialize,
    templates,
    templateMap,
    views,
  } = props;
  const templateGallery = template.templateLanguage === GALLERY.templateLanguage;
  const renderer = languages[template.templateLanguage] && languages[template.templateLanguage].renderer;
  const showChart = !templateGallery && renderer && templateComplete;

  const materializedViews = Object.entries(viewsToMaterialize).reduce((acc, row) => {
    const [key, values] = row;
    values.forEach(value => {
      acc.push({key, value});
    });
    return acc;
  }, []);
  console.log(materializedViews);
  return (
    <div className="flex-down full-width full-height" style={{overflow: 'hidden'}}>
      <div className="chart-controls full-width flex">
        <div className="view-container">
          {views.map((view, idx) =>
            viewOption({idx, view, currentView, changeViewName, switchView, deleteView}),
          )}
          {newViewButton({createNewView, cloneView})}
        </div>
      </div>
      <div
        className={classnames({
          'chart-container': true,
          center: true,
          'full-width': encodingMode !== GALLERY.templateName,
          'full-height': true,
        })}
      >
        {templateGallery && (
          <DataSearchMode
            deleteTemplate={deleteTemplate}
            columns={columns}
            setEncodingMode={setEncodingMode}
            spec={spec}
            templates={templates}
          />
        )}
        {showChart &&
          !materializedViews.length &&
          renderer({
            data,
            spec,
            onError: (e): void => {
              console.log('upper error', e);
            },
          })}
        {showChart &&
          materializedViews.length &&
          materializedViews.map(view => {
            return renderer({
              data,
              spec: evaluateHydraProgram(template, {...templateMap, [view.key]: `"${view.value}"`}),
              onError: (e): void => {
                console.log('upper error', e);
              },
            });
          })}
        {!templateGallery && !showChart && (
          <div className="chart-unfullfilled">
            <h2> Chart is not yet filled out </h2>
            <h5>Select values for the following fields: {missingFields.join(', ')}</h5>
          </div>
        )}
      </div>
    </div>
  );
}
