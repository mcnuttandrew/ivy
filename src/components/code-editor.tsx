import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {MdPlayCircleOutline} from 'react-icons/md';
import stringify from 'json-stringify-pretty-compact';
import {FaAngleDown, FaAngleUp} from 'react-icons/fa';
import {synthesizeSuggestions, takeSuggestion} from '../utils/introspect';

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
  tabMode: string;
  suggestionBox: boolean;
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
      tabMode: 'CODE',
      suggestionBox: true,
    };
  }
  editorDidMount(editor: any) {
    editor.focus();
    // @ts-ignore
    import('monaco-themes/themes/Cobalt.json').then(data => {
      // @ts-ignore
      monaco.editor.defineTheme('cobalt', data);
      // @ts-ignore
      monaco.editor.setTheme('cobalt');
    });
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
                    code: stringify(action(JSON.parse(currentCode))),
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
    const {updateMode, tabMode, suggestionBox} = this.state;

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
          <div className="code-option-tabs">
            {['CODE', 'TEMPLATE', 'OUTPUT', 'STATE_MAP'].map(key => {
              return (
                <div
                  className={classnames({
                    'code-option-tab': true,
                    'selected-tab': key === tabMode,
                  })}
                  key={key}
                  onClick={() => this.setState({tabMode: key})}
                >
                  {key}
                </div>
              );
            })}
          </div>
          <MonacoEditor
            ref="monaco"
            language="json"
            theme="monokai"
            height={suggestionBox ? 'calc(100% - 300px)' : 'calc(100% - 110px)'}
            value={currentCode}
            options={EDITOR_OPTIONS}
            onChange={(code: string) => {
              if (updateMode === 'automatic') {
                this.handleCodeUpdate(code);
              }
            }}
            editorDidMount={this.editorDidMount}
          />
          <div>
            <div className="suggestion-box-header flex space-between">
              <h5>Suggestions</h5>
              <div
                onClick={() => this.setState({suggestionBox: !suggestionBox})}
              >
                {suggestionBox ? <FaAngleDown /> : <FaAngleUp />}
              </div>
            </div>
            {suggestionBox && (
              <div className="suggestion-box-body">
                {false &&
                  synthesizeSuggestions(currentCode, []).map(
                    (suggestion: any, idx: number) => {
                      const {from, to, comment = '', sideEffect} = suggestion;
                      return (
                        <button
                          onClick={() => {
                            {
                              /* this.setState({
                          code: takeSuggestion(code, suggestion),
                          widgets: sideEffect
                            ? widgets.push(sideEffect())
                            : widgets,
                        }); */
                            }
                          }}
                          key={`${from} -> ${to}-${idx}`}
                        >
                          {comment}
                        </button>
                      );
                    },
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
