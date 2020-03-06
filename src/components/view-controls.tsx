import React from 'react';
import {TiCog, TiDocumentAdd} from 'react-icons/ti';
import {IgnoreKeys} from 'react-hotkeys';
import {GenericAction} from '../actions';
import Tooltip from 'rc-tooltip';
import {classnames} from '../utils';

interface NewViewProps {
  cloneView: GenericAction<void>;
  createNewView: GenericAction<void>;
}

function newViewButton(props: NewViewProps): JSX.Element {
  const {createNewView} = props;
  return (
    <div className="view-control new-view" onClick={(): any => createNewView()}>
      <TiDocumentAdd />
    </div>
  );
  //   old version kept around
  //   return (
  //     <Tooltip
  //       placement="bottom"
  //       trigger="click"
  //       overlay={
  //         <span className="flex-down">
  //           <div className="flex">
  //             <button type="button" onClick={(): any => createNewView()}>
  //               NEW
  //             </button>
  //             <span>Create a new view from the initial selection.</span>
  //           </div>
  //           <div className="flex">
  //             <button type="button" onClick={(): any => cloneView()}>
  //               CLONE
  //             </button>
  //             <span>Clone the current view into a new view.</span>
  //           </div>
  //         </span>
  //       }
  //     >
  //       <div className="view-control new-view">
  //         <TiDocumentAdd />
  //       </div>
  //     </Tooltip>
  //   );
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
      onClick={(e: any): void => {
        if (e.target.tagName.toLowerCase() === 'button') {
          switchView(view);
        }
      }}
    >
      <button type="button">{view}</button>
      <Tooltip
        placement="bottom"
        trigger="click"
        overlay={
          <div>
            <div>View Controls</div>
            <IgnoreKeys style={{height: '100%'}}>
              <input
                aria-label={`Set view name`}
                value={view}
                type="text"
                onChange={(e): any => changeViewName({idx, value: e.target.value})}
              />
            </IgnoreKeys>
            <button type="button" onClick={(): any => deleteView(view)}>
              delete view
            </button>
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

interface Props {
  changeViewName: GenericAction<{idx: number; value: string}>;
  cloneView: GenericAction<void>;
  createNewView: GenericAction<void>;
  currentView: string;
  deleteView: GenericAction<string>;
  switchView: GenericAction<string>;
  views: string[];
}

export default function ViewControls(props: Props): JSX.Element {
  const {changeViewName, cloneView, createNewView, currentView, deleteView, switchView, views} = props;
  return (
    <div className="chart-controls full-width flex">
      <div className="view-container">
        {views.map((view, idx) =>
          viewOption({idx, view, currentView, changeViewName, switchView, deleteView}),
        )}
        {newViewButton({createNewView, cloneView})}
      </div>
    </div>
  );
}
