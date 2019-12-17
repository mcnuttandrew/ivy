import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {MdPlayCircleOutline} from 'react-icons/md';
import stringify from 'json-stringify-pretty-compact';
import {FaAngleDown, FaAngleUp} from 'react-icons/fa';

import {Template} from '../templates/types';
import {synthesizeSuggestions, takeSuggestion} from '../utils/introspect';
import {GenericAction} from '../actions';
import {EDITOR_OPTIONS} from '../constants/index';
import {classnames, serializeTemplate, deserializeTemplate} from '../utils';
import Selector from './selector';

interface Props {
  codeMode: string;
  editorError: null | string;
  specCode: string;
  spec: any;
  template?: Template;
  setNewSpecCode: GenericAction;
  setCodeMode: GenericAction;
}
type updateMode = 'automatic' | 'manual';
interface State {
  error?: string;
  updateMode: updateMode;
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

  getCurrentCode() {
    const {template, codeMode, specCode, spec} = this.props;
    if (codeMode === 'CODE') {
      return template ? template.code : specCode;
    }
    if (codeMode === 'TEMPLATE') {
      return template ? serializeTemplate(template) : 'TEMPLATE NOT AVAILABLE';
    }
    if (codeMode === 'OUTPUT') {
      return stringify(spec);
    }
  }

  editorControls() {
    const {setNewSpecCode} = this.props;
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
                  {
                    /* code: stringify(action(JSON.parse(currentCode))), */
                  }
                  setNewSpecCode({
                    code: '',
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
    const {editorError, setCodeMode, codeMode} = this.props;
    const {updateMode, suggestionBox} = this.state;
    const currentCode = this.getCurrentCode();

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
            {['CODE', 'TEMPLATE', 'OUTPUT'].map(key => {
              return (
                <div
                  className={classnames({
                    'code-option-tab': true,
                    'selected-tab': key === codeMode,
                  })}
                  key={key}
                  onClick={() => setCodeMode(key)}
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
              if (codeMode !== 'CODE') {
                return;
              }
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
