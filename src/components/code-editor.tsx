import React from 'react';
import MonacoEditor from 'react-monaco-editor';

import {GenericAction} from '../actions';
import {classnames} from '../utils';

interface Props {
  currentCode: string;
  height: number;
  width: number;
  setNewSpecCode: GenericAction;
}

interface State {
  error?: string;
}

export default class CodeEditor extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
    this.state = {
      error: null,
    };
  }
  editorDidMount(editor: any) {
    editor.focus();
  }

  render() {
    const {currentCode, height, width, setNewSpecCode} = this.props;
    const {error} = this.state;
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
            'has-error': Boolean(error),
          })}
        >
          ERROR
        </div>
        <MonacoEditor
          width={width}
          height={height}
          language="json"
          theme="vs-light"
          value={currentCode}
          options={options}
          onChange={(code: string) => {
            let inError = true;
            Promise.resolve()
              .then(() => JSON.parse(code))
              .then(() => {
                inError = false;
                this.setState({error: null});
              })
              .catch(e => this.setState({error: JSON.stringify(e)}))
              .then(() => {
                setNewSpecCode({code, inError});
              });
          }}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}
