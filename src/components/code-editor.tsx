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

const SHORTCUTS = [
  {
    name: 'Add Height/Width',
    action: (code: any) => {
      const usingNested = !!code.spec;
      if (usingNested) {
        code.spec.height = 500;
        code.spec.width = 500;
      } else {
        code.height = 500;
        code.width = 500;
      }
      return code;
    },
  },
];

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
        <div>
          {SHORTCUTS.map((shortcut: any) => {
            const {action, name} = shortcut;
            return (
              <button
                key={name}
                onClick={() => {
                  setNewSpecCode({
                    code: JSON.stringify(
                      action(JSON.parse(currentCode)),
                      null,
                      2,
                    ),
                    inError: false,
                  });
                }}
              >
                {name}
              </button>
            );
          })}
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
