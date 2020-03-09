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

// export const
export const WIDGET_VALUES = 'Settings';
export const WIDGET_CONFIGURATION = 'Params';
export const JSON_OUTPUT = 'Output';
export const TEMPLATE_BODY = 'Body';

/* eslint-disable no-undef*/
export const PREVENT_ACCIDENTAL_LEAVE = process.env.NODE_ENV === 'production';
/* eslint-enable no-undef*/

export const switchCommon = {
  offColor: '#36425C',
  onColor: '#36425C',
  height: 15,
  checkedIcon: false,
  width: 50,
};

export const MATERIALIZING = '$PARAMETER FANNED OUT$';
export const AUTHORS = 'Ivy Authors';

export const HOT_KEYS: {[x: string]: string} = {
  UNDO: 'command+z',
  REDO: 'command+shift+z',
  CLOSE_MODALS: 'Escape',
  HOME: 'h',
  CLEAR_ENCODING: 'r',
  TOGGLE_EDIT: 'e',
};

export const HOT_KEY_DESCRIPTIONS: {[x: string]: string} = {
  UNDO: 'Undo most recent action',
  REDO: 'Redo most recent action',
  CLOSE_MODALS: 'Close any open modals',
  HOME: 'Return to the gallery',
  CLEAR_ENCODING: 'Reset all current settings to default',
  TOGGLE_EDIT: 'Toggle Edit mode on / off',
};
