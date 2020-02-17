import React from 'react';
import VegaWrapper from './renderers/vega-wrap';
import {VegaTheme, ColumnHeader, Json} from '../types';
import {Template} from '../templates/types';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog, TiDocumentAdd, TiTabsOutline} from 'react-icons/ti';
import {IgnoreKeys} from 'react-hotkeys';
import {GenericAction, DataRow} from '../actions';
import DataSearchMode from './renderers/data-search-mode';
import NONE from '../templates/example-templates/none';

interface ChartAreaProps {
  cloneView: GenericAction<void>;
  createNewView: GenericAction<void>;
  changeViewName: GenericAction<{idx: number; value: string}>;
  columns: ColumnHeader[];
  currentTheme: VegaTheme;
  currentView: string;
  data: DataRow[];
  deleteView: GenericAction<string>;
  deleteTemplate: GenericAction<string>;
  encodingMode: string;
  missingFields: string[];
  setEncodingMode: GenericAction<string>;
  spec: Json;
  switchView: GenericAction<string>;
  template?: Template;
  templates: Template[];
  templateComplete: boolean;
  views: string[];
}

interface NewViewProps {
  createNewView: GenericAction<void>;
}

function newViewButton(props: NewViewProps): JSX.Element {
  const {createNewView} = props;
  return (
    <Tooltip
      placement="bottom"
      trigger="hover"
      overlay={<span className="tooltip-internal">Create a new view from the initial selection.</span>}
    >
      <div className="view-control" onClick={(): any => createNewView()}>
        <span className="margin-right">New</span>
        <TiDocumentAdd />
      </div>
    </Tooltip>
  );
}
interface CloneViewrops {
  cloneView: GenericAction<void>;
}

function cloneViewButton(props: CloneViewrops): JSX.Element {
  const {cloneView} = props;
  return (
    <Tooltip
      placement="bottom"
      trigger="hover"
      overlay={<span className="tooltip-internal">Clone the current view into a new view.</span>}
    >
      <div className="view-control" onClick={(): any => cloneView()}>
        <span className="margin-right">Clone</span>
        <TiTabsOutline />
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

export default class ChartArea extends React.Component<ChartAreaProps> {
  render(): JSX.Element {
    const {
      changeViewName,
      cloneView,
      columns,
      createNewView,
      currentTheme,
      currentView,
      data,
      deleteView,
      deleteTemplate,
      encodingMode,
      missingFields,
      setEncodingMode,
      spec,
      switchView,
      template,
      templateComplete,
      templates,
      views,
    } = this.props;
    const noneTemplate = template && template.templateLanguage === 'none';
    const showChart = !noneTemplate && (!template || templateComplete);
    return (
      <div className="flex-down full-width full-height" style={{overflow: 'hidden'}}>
        <div className="chart-controls full-width flex">
          {newViewButton({createNewView})}
          {cloneViewButton({cloneView})}
          <div className="view-container">
            {views.map((view, idx) =>
              viewOption({idx, view, currentView, changeViewName, switchView, deleteView}),
            )}
          </div>
        </div>
        <div
          className={classnames({
            'chart-container': true,
            center: true,
            'full-width': encodingMode !== NONE.templateName,
            'full-height': true,
          })}
        >
          {noneTemplate && (
            <DataSearchMode
              deleteTemplate={deleteTemplate}
              columns={columns}
              setEncodingMode={setEncodingMode}
              spec={spec}
              templates={templates}
            />
          )}
          {showChart && (
            <VegaWrapper
              spec={spec}
              data={data}
              theme={currentTheme}
              language={template && template.templateLanguage}
            />
          )}
          {!noneTemplate && !showChart && (
            <div className="chart-unfullfilled">
              <h2> Chart is not yet filled out </h2>
              <h5>{`Select values for the following fields: ${missingFields.join(', ')}`}</h5>
            </div>
          )}
        </div>
      </div>
    );
  }
}
