import React from 'react';
import MonacoEditor from 'react-monaco-editor';

import {GenericAction} from '../actions';
import {classnames} from '../utils';

interface Props {
  currentCode: string;
  editorError: null | string;
  setNewSpecCode: GenericAction;
}

interface State {
  error?: string;
}

export default class CodeEditor extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
  }
  editorDidMount(editor: any) {
    editor.focus();
  }

  render() {
    const {currentCode, setNewSpecCode, editorError} = this.props;
    const options = {
      selectOnLineNumbers: true,
      minimap: {
        enabled: false,
      },
    };
    return (
      <div className="full-height full-width inline-block code-container">
        <div
          className={classnames({
            'error-bar': true,
            'has-error': Boolean(editorError),
          })}
        >
          ERROR
        </div>
        <MonacoEditor
          language="json"
          theme="vs-light"
          value={currentCode}
          options={options}
          onChange={(code: string) => {
            Promise.resolve()
              .then(() => JSON.parse(code))
              .then(() => setNewSpecCode({code, inError: false}))
              .catch(() => setNewSpecCode({code, inError: true}));
          }}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}
