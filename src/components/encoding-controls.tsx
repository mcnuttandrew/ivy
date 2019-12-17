import React from 'react';
import {FaEraser} from 'react-icons/fa';
import {GenericAction} from '../actions/index';
import EncodingModeSelector from './encoding-mode-selector';
import {Template} from '../templates/types';

interface Props {
  encodingMode: string;
  templates?: Template[];
  editMode: boolean;

  setEncodingMode: GenericAction;
  deleteTemplate: GenericAction;
  clearEncoding: GenericAction;
  setEditMode: GenericAction;
}

export default function EncodingControls(props: Props) {
  const {
    encodingMode,
    deleteTemplate,
    templates,
    setEncodingMode,
    clearEncoding,
    editMode,
    setEditMode,
  } = props;
  return (
    <div className="encoding-mode-selector">
      <div className="flex full-width space-between">
        <div className="flex-down">
          <h1 className="section-title">ENCODING MODE</h1>
          <h3>{encodingMode}</h3>
        </div>
        <div className="flex-down">
          <EncodingModeSelector
            deleteTemplate={deleteTemplate}
            templates={templates}
            setEncodingMode={setEncodingMode}
          />
          <div className="clear-encoding" onClick={clearEncoding}>
            <FaEraser />
            Clear
          </div>
          <div
            className="clear-encoding"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'STOP EDIT' : 'START EDIT'}
          </div>
        </div>
      </div>
      <div>UNSAVED CHANGES</div>
    </div>
  );
}
