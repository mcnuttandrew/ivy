import React from 'react';
import {Template, ColumnHeader, Json, HydraExtension, ViewsToMaterialize, TemplateMap} from '../types';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog, TiDocumentAdd} from 'react-icons/ti';
import {IgnoreKeys} from 'react-hotkeys';
import {GenericAction, DataRow, SetTemplateValuePayload} from '../actions';
import Gallery from './gallery';
import GALLERY from '../templates/gallery';
import {evaluateHydraProgram} from '../hydra-lang';

interface ChartAreaProps {
  changeViewName: GenericAction<{idx: number; value: string}>;
  cloneView: GenericAction<void>;
  columns: ColumnHeader[];
  createNewView: GenericAction<void>;
  currentView: string;
  data: DataRow[];
  deleteTemplate: GenericAction<string>;
  deleteView: GenericAction<string>;
  encodingMode: string;
  languages: {[x: string]: HydraExtension};
  missingFields: string[];
  setEncodingMode: GenericAction<string>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  spec: Json;
  switchView: GenericAction<string>;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templates: Template[];
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

function* cartesian(head?: any, ...tail: any): any {
  const remainder = tail.length > 0 ? cartesian(...tail) : [[]];
  for (const r of remainder) for (const h of head) yield [h, ...r];
}
interface MaterializeWrapperProps {
  materializedViews: TemplateMap[];
  templateMap: TemplateMap;
  template: Template;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setAllTemplateValues: GenericAction<TemplateMap>;
  viewsToMaterialize: ViewsToMaterialize;
  data: DataRow[];
  spec: any;
  renderer: any;
}

function materializeWrapper(props: MaterializeWrapperProps): JSX.Element {
  const {
    data,
    materializedViews,
    templateMap,
    template,
    setMaterialization,
    setAllTemplateValues,
    viewsToMaterialize,
    renderer,
  } = props;
  const keySet = Object.entries(viewsToMaterialize)
    .filter(d => d[1].length)
    .reduce((acc, d: [string, string[]]) => acc.add(d[0]), new Set());

  function removeButton(name: string, key: string, value: string): JSX.Element {
    return (
      <button
        onClick={(): void => {
          // const key = Array.from(keySet)[0] as string;
          // const value = view[key];
          setMaterialization({
            ...viewsToMaterialize,
            [key]: (viewsToMaterialize[key] || []).filter(d => d !== value),
          });
        }}
      >
        {name}
      </button>
    );
  }
  return (
    <React.Fragment>
      {materializedViews.map((view, idx) => {
        const newTemplateMap = {...templateMap, ...view};
        const spec = evaluateHydraProgram(template, newTemplateMap);
        return (
          <div key={`view-${idx}`} className="render-wrapper">
            <div>
              <span className="render-wrapper-title">
                {Object.entries(view)
                  .map(row => row.join(': '))
                  .join(' ')}
              </span>
              <button
                onClick={(): void => {
                  const newMat = Object.keys(view).reduce(
                    (acc, row) => {
                      acc[row] = [];
                      return acc;
                    },
                    {...viewsToMaterialize},
                  );
                  setMaterialization(newMat);
                  setAllTemplateValues(newTemplateMap);
                }}
              >
                SELECT
              </button>
              {keySet.size === 1 &&
                removeButton(
                  'REMOVE',
                  Array.from(keySet)[0] as string,
                  view[Array.from(keySet)[0] as string] as string,
                )}
              {keySet.size > 1 && (
                <Tooltip
                  placement="top"
                  trigger="click"
                  overlay={
                    <div className="flex-down">
                      <h3>Remove which of the following keys</h3>
                      {Array.from(keySet).map((key: string) => {
                        return removeButton(
                          `${key}: ${view[key as string]}`,
                          key,
                          view[key as string] as string,
                        );
                      })}
                    </div>
                  }
                >
                  <button>REMOVE</button>
                </Tooltip>
              )}
            </div>
            {renderer({
              data,
              spec,
              onError: (e: any): void => {
                console.log('upper error', e);
              },
            })}
          </div>
        );
      })}{' '}
    </React.Fragment>
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
    setMaterialization,
    setAllTemplateValues,
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

  const preCart = Object.entries(viewsToMaterialize).map(([key, values]) => {
    return values.map(value => ({key, value}));
  });
  const materializedViews = preCart.length
    ? [...cartesian(...preCart)].map(combo => {
        return combo.reduce((acc: any, row: any) => ({...acc, [row.key]: row.value}), {});
      })
    : [];

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
          'multi-view-container': materializedViews.length > 0,
          center: true,
          'full-width': encodingMode !== GALLERY.templateName,
          'full-height': true,
        })}
      >
        {templateGallery && (
          <Gallery
            deleteTemplate={deleteTemplate}
            columns={columns}
            setEncodingMode={setEncodingMode}
            spec={spec}
            templates={templates}
          />
        )}
        {showChart &&
          materializedViews.length === 0 &&
          renderer({
            data,
            spec,
            onError: (e): void => {
              console.log('upper error', e);
            },
          })}
        {showChart &&
          materializedViews.length > 0 &&
          materializeWrapper({
            materializedViews,
            templateMap,
            template,
            setMaterialization,
            setAllTemplateValues,
            viewsToMaterialize,
            data,
            spec,
            renderer,
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
