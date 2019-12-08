import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {MdPlayCircleOutline} from 'react-icons/md';

import {GenericAction} from '../actions';
import {EDITOR_OPTIONS} from '../constants/index';
import {classnames} from '../utils';
import Selector from './selector';

interface Props {
  currentCode: string;
  editorError: null | string;
  setNewSpecCode: GenericAction;
}
type updateMode = 'automatic' | 'manual';
interface State {
  error?: string;
  updateMode: updateMode;
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
  {
    name: 'Clean Up',
    action: (code: any) => code,
  },
];

export default class CodeEditor extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
    this.handleCodeUpdate = this.handleCodeUpdate.bind(this);
    this.state = {
      error: null,
      updateMode: 'automatic',
    };
  }
  editorDidMount(editor: any) {
    editor.focus();
  }

  editorControls() {
    const {currentCode, setNewSpecCode} = this.props;
    const {updateMode} = this.state;
    return (
      <div className="flex code-editor-controls">
        <div className="execute-code-control">
          <div
            className="execute-code-control-button"
            onClick={() => {
              // @ts-ignore
              const model = this.refs.monaco.editor.getModel();
              const value = model.getValue();
              this.handleCodeUpdate(value);
            }}
          >
            <MdPlayCircleOutline />
          </div>
          <Selector
            onChange={newMode => {
              this.setState({updateMode: newMode});
            }}
            selectedValue={updateMode}
            options={[
              {display: 'Auto', value: 'automatic'},
              {display: 'Manual', value: 'manual'},
            ]}
          />
        </div>
        <div>
          <h5>Macros</h5>
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
      </div>
    );
  }

  handleCodeUpdate(code: string) {
    const {setNewSpecCode} = this.props;
    Promise.resolve()
      .then(() => JSON.parse(code))
      .then(() => setNewSpecCode({code, inError: false}))
      .catch(() => setNewSpecCode({code, inError: true}));
  }

  render() {
    const {currentCode, editorError} = this.props;
    const {updateMode} = this.state;

    return (
      <div className="full-height full-width">
        {this.editorControls()}
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
            ref="monaco"
            language="json"
            theme="vs-light"
            value={currentCode}
            options={EDITOR_OPTIONS}
            onChange={(code: string) => {
              if (updateMode === 'automatic') {
                this.handleCodeUpdate(code);
              }
            }}
            editorDidMount={this.editorDidMount}
          />
        </div>
      </div>
    );
  }
}
