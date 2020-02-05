import React from 'react';
import VegaWrapper from './vega-wrap';
import {VegaTheme} from '../types';
import {Template, TemplateMap} from '../templates/types';
import {classnames} from '../utils';
import {MdSettings, MdContentCopy, MdNoteAdd} from 'react-icons/md';
import {GiBinoculars} from 'react-icons/gi';
import {GenericAction, DataRow} from '../actions';
import Popover from './popover';
import DataSearchMode from './program-search/data-search-mode';

interface ChartAreaProps {
  cloneView: GenericAction<void>;
  createNewView: GenericAction<void>;
  changeViewName: GenericAction<{idx: number; value: string}>;
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
      cloneView,
      changeViewName,
      createNewView,
      currentTheme,
      currentView,
      data,
      deleteView,
      encodingMode,
      missingFields,
      spec,
      switchView,
      template,
      templates,
      templateMap,
      templateComplete,
      setEncodingMode,
      views,
    } = this.props;
    const noneTemplate = template && template.templateLanguage === 'none';
    const showChart = !noneTemplate && (!template || templateComplete);
    return (
      <div className="flex-down full-width full-height">
        <div className="chart-controls full-width flex">
          <div className="view-control" onClick={(): any => createNewView()}>
            <span className="margin-right">New</span>
            <MdNoteAdd />
          </div>
          <div className="view-control" onClick={(): any => cloneView()}>
            <span className="margin-right">Clone</span>
            <MdContentCopy />
          </div>
          <div className="view-control" onClick={(): any => setEncodingMode('_____none_____')}>
            <span className="margin-right">Templates</span>
            <GiBinoculars />
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
                        <MdSettings />
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
            'full-width': !!encodingMode,
            'full-height': true,
          })}
        >
          {noneTemplate && (
            <DataSearchMode
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
