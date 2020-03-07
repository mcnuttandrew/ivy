import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {IgnoreKeys} from 'react-hotkeys';

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
}

export default class CodeEditor extends React.Component<Props> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
  }
  editorDidMount(editor: any): void {
    editor.focus();
    /* eslint-disable */
    // @ts-ignore
    import('monaco-themes/themes/Chrome DevTools.json').then(data => {
      // @ts-ignore
      monaco.editor.defineTheme('cobalt', data);
      // @ts-ignore
      monaco.editor.setTheme('cobalt');
    });
    /* eslint-enable */
  }

  componentDidUpdate(props: any): void {
    // on change code mode scroll to top
    if (props.codeMode !== this.props.codeMode) {
      /* eslint-disable */
      // @ts-ignore
      this.refs.monaco.editor.setScrollPosition({scrollTop: 0});
      /* eslint-enable */
    }
  }

  render(): JSX.Element {
    const {
      codeMode,
      currentCode,
      editMode,
      editorFontSize,
      editorLineWrap,
      handleCodeUpdate,
      setCodeMode,
      setEditMode,
    } = this.props;
    console.log('monaco render');
    return (
      /*eslint-disable react/no-string-refs*/
      <IgnoreKeys style={{height: '100%'}}>
        <MonacoEditor
          ref="monaco"
          language="json"
          theme="monokai"
          height="100%"
          value={currentCode}
          options={{
            ...EDITOR_OPTIONS,
            fontSize: editorFontSize,
            wordWrap: editorLineWrap ? 'on' : 'off',
          }}
          onChange={(code: string): void => {
            if (!editMode) {
              setEditMode(true);
            }
            if (codeMode === JSON_OUTPUT) {
              setCodeMode(TEMPLATE_BODY);
              return;
            }

            handleCodeUpdate(code);
          }}
          editorDidMount={this.editorDidMount}
        />
      </IgnoreKeys>
      /*eslint-en able react/no-string-refs*/
    );
  }
}
