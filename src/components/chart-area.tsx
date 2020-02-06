import React from 'react';
import VegaWrapper from './vega-wrap';
import {VegaTheme, ColumnHeader} from '../types';
import {Template, TemplateMap} from '../templates/types';
import {classnames} from '../utils';
import Tooltip from 'rc-tooltip';
import {TiCog, TiDocumentAdd, TiChartBarOutline, TiTabsOutline} from 'react-icons/ti';
import {GenericAction, DataRow} from '../actions';
import DataSearchMode from './program-search/data-search-mode';
import {NONE_TEMPLATE} from '../constants/index';

interface ChartAreaProps {
  cloneView: GenericAction<void>;
  createNewView: GenericAction<void>;
  chainActions: GenericAction<any>;
  changeViewName: GenericAction<{idx: number; value: string}>;
  clearEncoding: GenericAction<void>;
  columns: ColumnHeader[];
  currentTheme: VegaTheme;
  currentView: string;
  data: DataRow[];
  deleteView: GenericAction<string>;
  encodingMode: string;
  missingFields: string[];
  setEncodingMode: GenericAction<string>;
  spec: any;
  switchView: GenericAction<string>;
  template?: Template;
  templates: Template[];
  templateMap: TemplateMap;
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

interface SeeOptionsButtonProps {
  setEncodingMode: GenericAction<string>;
  clearEncoding: GenericAction<void>;
  chainActions: GenericAction<any>;
  onOptionsScreen: boolean;
}

function seeOptionsButton(props: SeeOptionsButtonProps): JSX.Element {
  const {setEncodingMode, clearEncoding, chainActions, onOptionsScreen} = props;
  return (
    <Tooltip
      placement="bottom"
      trigger="hover"
      overlay={
        <span className="tooltip-internal">
          {onOptionsScreen
            ? 'Already on the template selection screen, click this will do nothing'
            : 'Return to the template selection screen'}
        </span>
      }
    >
      <div
        className={classnames({
          'view-control': true,
          'selected-view-control': onOptionsScreen,
        })}
        onClick={(): any =>
          chainActions([(): any => setEncodingMode(NONE_TEMPLATE), (): any => clearEncoding()])
        }
      >
        <span className="margin-right">Templates</span>
        <TiChartBarOutline />
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
            <input
              value={view}
              type="text"
              onChange={(e): any => changeViewName({idx, value: e.target.value})}
            />
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
      chainActions,
      clearEncoding,
      cloneView,
      columns,
      createNewView,
      currentTheme,
      currentView,
      data,
      deleteView,
      encodingMode,
      missingFields,
      setEncodingMode,
      spec,
      switchView,
      template,
      templateComplete,
      templateMap,
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
          {seeOptionsButton({
            setEncodingMode,
            clearEncoding,
            chainActions,
            onOptionsScreen: template && template.templateName === NONE_TEMPLATE,
          })}
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
            'full-width': encodingMode !== NONE_TEMPLATE,
            'full-height': true,
          })}
        >
          {noneTemplate && (
            <DataSearchMode
              columns={columns}
              setEncodingMode={setEncodingMode}
              templates={templates}
              templateMap={templateMap}
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
