import React from 'react';
import {IgnoreKeys} from 'react-hotkeys';
import {Editor, StandardBundle} from 'prong-editor';
import 'prong-editor/style.css';
import {debounce} from 'vega';

import {EDITOR_OPTIONS, JSON_OUTPUT, TEMPLATE_BODY} from '../constants/index';
import {GenericAction} from '../actions';

interface Props {
  codeMode: string;
  currentCode: string;
  editMode: boolean;
  editorFontSize: number;
  editorLineWrap: boolean;
  handleCodeUpdate: (x: string) => void;
  setCodeMode: GenericAction<string>;
  setEditMode: GenericAction<boolean>;
  height: number;
}

function CodeEditor(props: Props) {
  const {editMode, setEditMode, handleCodeUpdate, setCodeMode, codeMode, currentCode, height} = props;

  return (
    <IgnoreKeys style={{height: '100%'}}>
      <Editor
        height={`${height}px`}
        schema={{}}
        code={currentCode}
        onChange={debounce(700, (code: string): void => {
          if (!editMode) {
            setEditMode(true);
          }
          if (codeMode === JSON_OUTPUT) {
            setCodeMode(TEMPLATE_BODY);
            return;
          }

          handleCodeUpdate(code);
        })}
        projections={Object.values(StandardBundle)}
      />
    </IgnoreKeys>
  );
}

export default CodeEditor;
