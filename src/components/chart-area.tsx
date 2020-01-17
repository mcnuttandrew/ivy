import {List} from 'immutable';
import React from 'react';
import VegaWrapper from './vega-wrap';
import {VegaTheme} from '../types';
import {Template} from '../templates/types';
import {classnames} from '../utils';
import {MdContentCopy, MdNoteAdd} from 'react-icons/md';
import {GenericAction} from '../actions';

interface ChartAreaProps {
  cloneView: GenericAction;
  createNewView: GenericAction;
  currentTheme: VegaTheme;
  currentView: string;
  data: any;
  deleteView: GenericAction;
  iMspec: any;
  missingFields: string[];
  spec: any;
  switchView: GenericAction;
  template?: Template;
  templateComplete: boolean;
  views: List<string>;
}

export default class ChartArea extends React.Component<ChartAreaProps> {
  render(): JSX.Element {
    const {
      cloneView,
      createNewView,
      currentTheme,
      currentView,
      data,
      iMspec,
      missingFields,
      spec,
      switchView,
      template,
      templateComplete,
      views,
    } = this.props;
    const noneTemplate = template && template.templateLanguage === 'none';
    const showChart = !noneTemplate && (!template || templateComplete);
    return (
      <div className="flex-down full-width full-height">
        <div className="chart-controls full-width flex">
          <div className="view-control" onClick={createNewView}>
            <span className="margin-right">New</span>
            <MdNoteAdd />
          </div>
          <div className="view-control" onClick={cloneView}>
            <span className="margin-right">Clone</span>
            <MdContentCopy />
          </div>
          <div className="view-container">
            {views.map((view: string) => {
              return (
                <div
                  key={view}
                  onClick={(): any => switchView(view)}
                  className={classnames({
                    'view-control': true,
                    selected: view === currentView,
                  })}
                >
                  {view}
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-container center full-width full-height">
          {showChart && (
            <VegaWrapper
              iMspec={iMspec}
              spec={spec}
              data={data}
              theme={currentTheme}
              language={template && template.templateLanguage}
            />
          )}
          {noneTemplate && (
            <div className="chart-unfullfilled">
              <h2> Select a chart to begin </h2>
              <h5>{`HINT HINT HINT HINT`}</h5>
            </div>
          )}
          {!showChart && !noneTemplate && (
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
