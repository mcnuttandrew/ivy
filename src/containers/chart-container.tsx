import React, {useState} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../actions/index';
import {ActionUser, GenericAction, DataRow, SetMaterializationPayload} from '../actions';
import {
  AppState,
  ColumnHeader,
  DataReducerState,
  LanguageExtension,
  Template,
  TemplateMap,
  ViewCatalog,
  RendererProps,
} from '../types';
import {TiDeleteOutline, TiInputChecked} from 'react-icons/ti';
import {evaluateIvyProgram, getMissingFields} from '../ivy-lang';
import Gallery from '../components/gallery';
import GALLERY from '../templates/gallery';
import {HoverTooltip} from '../components/tooltips';
import {wrangle} from '../utils/wrangle';
import {useWindowSize} from '../utils/hooks';
import ShowDataWindow from '../components/show-data';
import ErrorBoundary from '../components/error-boundary';
import ViewControls from '../components/view-controls';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';

function* cartesian(head?: any, ...tail: any): any {
  const remainder = tail.length > 0 ? cartesian(...tail) : [[]];
  for (const r of remainder) for (const h of head) yield [h, ...r];
}
interface MaterializeWrapperProps {
  data: DataRow[];
  editorError: null | string;
  materializedViews: TemplateMap[];
  renderer: any;
  setAllTemplateValues: GenericAction<TemplateMap>;
  setErrors: (x: any) => void;
  setMaterialization: GenericAction<SetMaterializationPayload>;
  spec: any;
  template: Template;
  templateMap: TemplateMap;
}

function prepareUpdate(
  oldTemplateMap: TemplateMap,
  newTemplateMap: TemplateMap,
  view: TemplateMap,
): TemplateMap {
  return {
    ...newTemplateMap,
    systemValues: {
      ...newTemplateMap.systemValues,
      viewsToMaterialize: Object.keys(view.paramValues).reduce(
        (acc, row) => {
          delete acc[row];
          return acc;
        },
        {...oldTemplateMap.systemValues.viewsToMaterialize},
      ),
    },
  };
}

function materializeWrapper(props: MaterializeWrapperProps): JSX.Element {
  const {
    data,
    editorError,
    materializedViews,
    renderer,
    setAllTemplateValues,
    setErrors,
    setMaterialization,
    template,
    templateMap,
  } = props;
  const keySet = Object.entries(templateMap.systemValues.viewsToMaterialize)
    .filter((d) => d[1].length)
    .reduce((acc, d: [string, string[]]) => acc.add(d[0]), new Set());
  function removeButton(name: string, key: string, value: string): JSX.Element {
    return (
      <div
        className="cursor-pointer"
        key={key}
        onClick={(): void => {
          const newVals = (templateMap.systemValues.viewsToMaterialize[key] || []).filter((d) => d !== value);
          setMaterialization({key, value: newVals});
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
      {materializedViews.map((view) => {
        const newTemplateMap: TemplateMap = {
          ...templateMap,
          paramValues: {...templateMap.paramValues, ...view.paramValues},
        };
        const spec = evaluateIvyProgram(template, newTemplateMap);
        const cardName = Object.entries(view.paramValues)
          .map((row) => row.join(': '))
          .join(' ');
        return (
          <div key={`view-${cardName}`} className="render-wrapper">
            <div className="render-wrapper-header">
              <span className="render-wrapper-title">{cardName}</span>
              <div className="flex render-wrapper-controls">
                <div
                  className="cursor-pointer"
                  onClick={(): any => setAllTemplateValues(prepareUpdate(templateMap, newTemplateMap, view))}
                >
                  <HoverTooltip message="select this view">
                    <TiInputChecked />
                  </HoverTooltip>
                </div>
                {keySet.size === 1 &&
                  removeButton(
                    'REMOVE',
                    Array.from(keySet)[0] as string,
                    view.paramValues[Array.from(keySet)[0] as string] as string,
                  )}
                {keySet.size > 1 && (
                  <Tooltip
                    placement="top"
                    trigger="click"
                    overlay={
                      <div className="flex-down">
                        <h3>Remove which of the following keys</h3>
                        {Array.from(keySet).map((key: string) => {
                          const shortStr = `${key}: ${view.paramValues[key as string]}`;
                          return (
                            <div className="flex" key={shortStr}>
                              {removeButton(shortStr, key, view.paramValues[key as string] as string)}
                              <span>{shortStr}</span>
                            </div>
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
            {/* TODO memoize */}
            <MemoizeRender
              renderer={renderer}
              data={data}
              spec={spec}
              editorError={editorError}
              onError={setErrors}
            />
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
  editorError: null | string;
}

const MemoizeRender = React.memo(
  function Memoizer(props: MemoizerProps): JSX.Element {
    const {renderer, onError, data, spec, editorError} = props;
    if (editorError) {
      return <div />;
    }
    onError(null);
    let render: JSX.Element;
    try {
      render = renderer({data, spec, onError});
      return render;
    } catch (e) {
      onError(e);
      return <div />;
    }
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.spec) === JSON.stringify(nextProps.spec) &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    );
  },
);

interface ChartContainerProps extends ActionUser {
  columns: ColumnHeader[];
  currentView: string;
  currentlySelectedFile: string;
  data: DataRow[];
  editMode: boolean;
  editorError: null | string;
  languages: {[x: string]: LanguageExtension};
  missingFields: string[];
  spec: any;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
  templates: Template[];
  views: string[];
  viewCatalog: ViewCatalog;
  width: number;
}

function ChartArea(props: ChartContainerProps): JSX.Element {
  const {
    changeViewName,
    cloneView,
    columns,
    createNewView,
    currentView,
    data,
    deleteView,
    editorError,
    languages,
    missingFields,
    saveCurrentTemplate,
    setAllTemplateValues,
    setEncodingMode,
    setMaterialization,
    setWidgetValue,
    spec,
    switchView,
    template,
    templateComplete,
    templateMap,
    templates,
    views,
    width,
  } = props;
  const windowSize = useWindowSize();
  const [errors, setErrors] = useState(null);
  const [showData, setShowData] = useState(false);
  // TODO memoize
  const preparedData = wrangle(data, templateMap.systemValues.dataTransforms);

  const templateGallery = template.templateLanguage === GALLERY.templateLanguage;
  const renderer = languages[template.templateLanguage] && languages[template.templateLanguage].renderer;
  const showChart = !templateGallery && renderer && templateComplete;

  const preCart = Object.entries(templateMap.systemValues.viewsToMaterialize).map(([key, values]) => {
    return values.map((value) => ({key, value}));
  });
  const materializedViews = preCart.length
    ? [...cartesian(...preCart)].map((combo) => {
        return combo.reduce((acc: any, row: any) => ({...acc, [row.key]: row.value}), {});
      })
    : [];

  return (
    <div
      style={{overflow: 'hidden', width: windowSize.width - width}}
      className={classnames({'flex-down': true, 'full-height': true})}
    >
      <div
        className={classnames({
          'chart-container': true,
          'multi-view-container': materializedViews.length > 0,
        })}
      >
        {templateGallery && (
          <Gallery
            columns={columns}
            saveCurrentTemplate={saveCurrentTemplate}
            setEncodingMode={setEncodingMode}
            setWidgetValue={setWidgetValue}
            spec={spec}
            templateMap={templateMap}
          />
        )}
        {showChart && materializedViews.length === 0 && (
          <MemoizeRender
            renderer={renderer}
            data={preparedData}
            spec={spec}
            editorError={editorError}
            onError={setErrors}
          />
        )}
        {showChart &&
          materializedViews.length > 0 &&
          materializeWrapper({
            data: preparedData,
            materializedViews: materializedViews.map(
              (paramValues: {[x: string]: string | string[]}): TemplateMap => ({
                systemValues: {viewsToMaterialize: {}, dataTransforms: []},
                paramValues,
              }),
            ),
            editorError,
            renderer,
            setAllTemplateValues,
            setMaterialization,
            setErrors,
            spec,
            template,
            templateMap,
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
        columns={columns}
        createNewView={createNewView}
        currentView={currentView}
        deleteView={deleteView}
        errors={errors}
        setEncodingMode={setEncodingMode}
        switchView={switchView}
        template={template}
        templateMap={templateMap}
        templates={templates}
        views={views}
        toggleShowData={(): any => setShowData(!showData)}
      />
      {showData && (
        <ErrorBoundary>
          <ShowDataWindow
            languages={languages}
            data={preparedData}
            spec={spec}
            template={template}
            templateMap={templateMap}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

export function mapStateToProps({base, data}: {base: AppState; data: DataReducerState}): any {
  const template = base.currentTemplateInstance;
  const templateMap = base.templateMap;
  const missingFields = (template && getMissingFields(template, templateMap)) || [];
  const spec = evaluateIvyProgram(template, templateMap);
  return {
    columns: base.columns,
    currentView: base.currentView,
    currentlySelectedFile: base.currentlySelectedFile,
    data: data.data,
    editorError: base.editorError,
    missingFields,
    spec,
    template,
    templateComplete: !missingFields.length,
    templateMap,
    templates: base.templates,
    numTemplate: base.templates.length,
    views: base.views,
    viewCatalog: base.viewCatalog,
  };
}

function equalityChecker(prevProps: any, nextProps: any): boolean {
  return Object.keys(prevProps).every((key) => {
    if (key === 'spec' || key === 'missingFields') {
      return JSON.stringify(prevProps[key]) === JSON.stringify(nextProps[key]);
    }
    return prevProps[key] === nextProps[key];
  });
}

export default connect(mapStateToProps, actionCreators)(React.memo(ChartArea, equalityChecker));
