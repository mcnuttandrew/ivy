import React from 'react';
import {TiDatabase} from 'react-icons/ti';
import {GenericAction} from '../actions/index';

interface Props {
  currentlySelectedFile: string;
  setModalState: GenericAction<string | null>;
}

export default function ImportDataColumn(props: Props): JSX.Element {
  const {currentlySelectedFile, setModalState} = props;

  return (
    <div className="flex-down full-height" style={{maxHeight: 'fit-content'}}>
      <h1 className="section-title">Data</h1>
      <div className="flex space-between data-selection">
        <div className="flex center">
          <TiDatabase />
          <div className="section-subtitle"> {currentlySelectedFile || 'SELECT FILE'}</div>
        </div>
        <button type="button" onClick={(): any => setModalState('data')}>
          CHANGE
        </button>
      </div>
    </div>
  );
}
