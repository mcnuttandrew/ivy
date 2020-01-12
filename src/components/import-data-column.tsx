import React from 'react';
import {DiDatabase} from 'react-icons/di';
import {GenericAction} from '../actions/index';

interface Props {
  currentlySelectedFile: string;
  toggleDataModal: GenericAction;
}

export default class ImportDataColumn extends React.Component<Props> {
  render(): JSX.Element {
    const {currentlySelectedFile, toggleDataModal} = this.props;

    return (
      <div className="flex-down full-height">
        <h1 className="section-title">Data</h1>
        <div className="flex space-between data-selection">
          <div className="flex center">
            <DiDatabase />
            <div className="section-subtitle"> {currentlySelectedFile || 'SELECT FILE'}</div>
          </div>
          <button onClick={toggleDataModal}>CHANGE</button>
        </div>
      </div>
    );
  }
}
