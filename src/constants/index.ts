export const test = 'test';
type ON = 'on';
export const EDITOR_OPTIONS = {
  selectOnLineNumbers: true,
  automaticLayout: true,
  wordWrap: 'on' as ON,
  minimap: {
    enabled: false,
  },
  fontSize: 10,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 3,
};

export const TEXT_TYPE: {[x: string]: string} = {
  MEASURE: '123',
  DIMENSION: 'ABC',
  TIME: '🕑',
};

export const GRAMMAR_NAME = 'grammer';
export const GRAMMAR_DESC = 'Tableau-style grammar of graphics';

export const NONE_TEMPLATE = '_____none_____';
