import React from 'react';
import MonacoEditor from 'react-monaco-editor';

interface CodeEditorProps {
  currentCode: string;
  height: number;
  width: number;
}

export default class CodeEditor extends React.Component<CodeEditorProps> {
  constructor(props: any) {
    super(props);
    this.editorDidMount = this.editorDidMount.bind(this);
  }
  editorDidMount(editor: any, monaco: any) {
    editor.focus();
  }

  render() {
    const {currentCode, height, width} = this.props;
    const options = {
      selectOnLineNumbers: true,
      minimap: {
        enabled: false,
      },
    };
    return (
      <div className="full-height full-width inline-block code-container">
        <MonacoEditor
          width={width}
          height={height}
          language="json"
          theme="vs-light"
          value={currentCode}
          options={options}
          onChange={() => {}}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}
