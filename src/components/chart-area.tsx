import {List} from 'immutable';
import React from 'react';
import VegaWrapper from './vega-wrap';
import {VegaTheme} from '../types';
import {Template} from '../templates/types';
import {cleanSpec, classnames} from '../utils';
import {MdContentCopy, MdNoteAdd} from 'react-icons/md';
import {GenericAction} from '../actions';

interface ChartAreaProps {
  spec: any;
  data: any;
  currentView: string;
  currentTheme: VegaTheme;
  iMspec: any;
  views: List<string>;
  template?: Template;
  templateComplete: boolean;

  createNewView: GenericAction;
  deleteView: GenericAction;
  switchView: GenericAction;
  cloneView: GenericAction;
}

export default class ChartArea extends React.Component<ChartAreaProps> {
  render() {
    const {
      spec,
      data,
      currentTheme,
      currentView,
      iMspec,
      views,
      createNewView,
      switchView,
      cloneView,
      template,
      templateComplete,
    } = this.props;

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
                  onClick={() => switchView(view)}
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
          {(!template || templateComplete) && (
            <VegaWrapper
              iMspec={iMspec}
              spec={spec}
              data={data}
              theme={currentTheme}
              language={template && template.templateLanguage}
            />
          )}
        </div>
      </div>
    );
  }
}
