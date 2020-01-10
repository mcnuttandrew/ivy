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
