import React from 'react';
import VegaWrapper from './vega-wrap';
import {VegaTheme, ColumnHeader} from '../types';
import {Template, TemplateMap} from '../templates/types';
import {classnames} from '../utils';
import {TiCog, TiDocumentAdd, TiChartBarOutline, TiTabsOutline} from 'react-icons/ti';
import {GenericAction, DataRow} from '../actions';
import Popover from './popover';
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
          <div className="view-control" onClick={(): any => createNewView()}>
            <span className="margin-right">New</span>
            <TiDocumentAdd />
          </div>
          <div className="view-control" onClick={(): any => cloneView()}>
            <span className="margin-right">Clone</span>
            <TiTabsOutline />
          </div>
          <div
            className="view-control"
            onClick={(): any =>
              chainActions([(): any => setEncodingMode(NONE_TEMPLATE), (): any => clearEncoding()])
            }
          >
            <span className="margin-right">Templates</span>
            <TiChartBarOutline />
          </div>
          <div className="view-container">
            {views.map((view, idx) => {
              return (
                <div
                  key={idx}
                  className={classnames({
                    'view-control': true,
                    selected: view === currentView,
                  })}
                >
                  <button onClick={(): any => switchView(view)}>{view}</button>
                  <Popover
                    className="list-options-popover"
                    clickTarget={
                      <span className="tool-description">
                        <TiCog />
                      </span>
                    }
                    style={{
                      width: '250px',
                      height: '200px',
                      left: '120px',
                      top: '50px',
                    }}
                    body={(): JSX.Element => {
                      return (
                        <div>
                          <div>View Controls</div>
                          <input
                            value={view}
                            type="text"
                            onChange={(e): any => changeViewName({idx, value: e.target.value})}
                          />
                          <button onClick={(): any => deleteView(view)}>delete view</button>
                        </div>
                      );
                    }}
                  />
                </div>
              );
            })}
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
