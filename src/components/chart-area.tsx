import React from 'react';
import {
  Template,
  ColumnHeader,
  Json,
  HydraExtension,
  ViewsToMaterialize,
  TemplateMap,
  RendererProps,
} from '../types';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiDeleteOutline, TiInputChecked} from 'react-icons/ti';
import ViewControls from './view-controls';
import {GenericAction, DataRow, SetTemplateValuePayload} from '../actions';
import Gallery from './gallery';
import GALLERY from '../templates/gallery';
import {evaluateHydraProgram} from '../hydra-lang';
import {HoverTooltip} from './tooltips';

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
  setAllTemplateValues: GenericAction<TemplateMap>;
  setEncodingMode: GenericAction<string>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  setTemplateValue: GenericAction<SetTemplateValuePayload>;
  spec: Json;
  switchView: GenericAction<string>;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templates: Template[];
  userName: string;
  views: string[];
  viewsToMaterialize: ViewsToMaterialize;
}

function* cartesian(head?: any, ...tail: any): any {
  const remainder = tail.length > 0 ? cartesian(...tail) : [[]];
  for (const r of remainder) for (const h of head) yield [h, ...r];
}
interface MaterializeWrapperProps {
  data: DataRow[];
  materializedViews: TemplateMap[];
  renderer: any;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setMaterialization: GenericAction<ViewsToMaterialize>;
  spec: any;
  template: Template;
  templateMap: TemplateMap;
  viewsToMaterialize: ViewsToMaterialize;
}

function materializeWrapper(props: MaterializeWrapperProps): JSX.Element {
  const {
    data,
    materializedViews,
    renderer,
    setAllTemplateValues,
    setMaterialization,
    template,
    templateMap,
    viewsToMaterialize,
  } = props;
  const keySet = Object.entries(viewsToMaterialize)
    .filter(d => d[1].length)
    .reduce((acc, d: [string, string[]]) => acc.add(d[0]), new Set());

  function removeButton(name: string, key: string, value: string): JSX.Element {
    return (
      <div
        className="cursor-pointer"
        onClick={(): void => {
          setMaterialization({
            ...viewsToMaterialize,
            [key]: (viewsToMaterialize[key] || []).filter(d => d !== value),
          });
        }}
      >
        <HoverTooltip message="remove this option from the fan out">
          <TiDeleteOutline />
        </HoverTooltip>
      </div>
    );
  }
  return (
    <React.Fragment>
      {materializedViews.map((view, idx) => {
        const newTemplateMap = {...templateMap, ...view};
        const spec = evaluateHydraProgram(template, newTemplateMap);
        return (
          <div key={`view-${idx}`} className="render-wrapper">
            <div className="render-wrapper-header">
              <span className="render-wrapper-title">
                {Object.entries(view)
                  .map(row => row.join(': '))
                  .join(' ')}
              </span>
              <div className="flex render-wrapper-controls">
                <div
                  className="cursor-pointer"
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
                  <HoverTooltip message="select this view">
                    <TiInputChecked />
                  </HoverTooltip>
                </div>
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
                    <div>
                      <TiDeleteOutline />
                    </div>
                  </Tooltip>
                )}
              </div>
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

interface MemoizerProps {
  renderer: (props: RendererProps) => JSX.Element;
  spec: any;
  data: DataRow[];
  onError: (x: any) => any;
}

class MemoizeRender extends React.Component<MemoizerProps> {
  shouldComponentUpdate(props: MemoizerProps): boolean {
    return (
      JSON.stringify(props.spec) !== JSON.stringify(this.props.spec) ||
      JSON.stringify(props.data) !== JSON.stringify(this.props.data)
    );
  }
  render(): JSX.Element {
    const {renderer, onError, data, spec} = this.props;
    return renderer({data, spec, onError});
  }
}

export default function ChartArea(props: ChartAreaProps): JSX.Element {
  const {
    changeViewName,
    cloneView,
    columns,
    createNewView,
    currentView,
    data,
    deleteTemplate,
    deleteView,
    encodingMode,
    languages,
    missingFields,
    setAllTemplateValues,
    setEncodingMode,
    setMaterialization,
    spec,
    switchView,
    template,
    templateComplete,
    templateMap,
    templates,
    userName,
    views,
    viewsToMaterialize,
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
    <div
      style={{overflow: 'hidden'}}
      className={classnames({
        'flex-down': true,
        'full-width': true,
        'full-height': true,
      })}
    >
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
            columns={columns}
            deleteTemplate={deleteTemplate}
            setEncodingMode={setEncodingMode}
            spec={spec}
            templates={templates}
            userName={userName}
          />
        )}
        {showChart && materializedViews.length === 0 && (
          <MemoizeRender
            renderer={renderer}
            data={data}
            spec={spec}
            onError={(e): void => {
              console.log('upper error', e);
            }}
          />
        )}
        {showChart &&
          materializedViews.length > 0 &&
          materializeWrapper({
            data,
            materializedViews,
            renderer,
            setAllTemplateValues,
            setMaterialization,
            spec,
            template,
            templateMap,
            viewsToMaterialize,
          })}
        {!templateGallery && !showChart && (
          <div className="chart-unfullfilled">
            <h2> Chart is not yet filled out </h2>
            <h5>Select values for the following fields: {missingFields.join(', ')}</h5>
          </div>
        )}
      </div>
      <ViewControls
        changeViewName={changeViewName}
        cloneView={cloneView}
        createNewView={createNewView}
        currentView={currentView}
        deleteView={deleteView}
        switchView={switchView}
        views={views}
      />
    </div>
  );
}
