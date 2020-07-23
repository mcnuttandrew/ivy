import config from './config.json';

export const USE_LOCAL = config.USE_LOCAL;

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

// code mode tabs
export const WIDGET_VALUES = 'Settings';
export const WIDGET_CONFIGURATION = 'Params';
export const JSON_OUTPUT = 'Output';
export const TEMPLATE_BODY = 'Body';

/* eslint-disable no-undef*/
export const PREVENT_ACCIDENTAL_LEAVE = process.env.NODE_ENV === 'production';
/* eslint-enable no-undef*/
export const SHOW_DATA_SELECTION_ON_LOAD = config.SHOW_DATA_SELECTION_ON_LOAD;

export const switchCommon = {
  offColor: '#800000',
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
  CLEAR_ENCODING: 'r',
  TOGGLE_EDIT: 'e',
};

export const HOT_KEY_DESCRIPTIONS: {[x: string]: string} = {
  UNDO: 'Undo most recent action',
  REDO: 'Redo most recent action',
  CLOSE_MODALS: 'Close any open modals',
  CLEAR_ENCODING: 'Reset all current settings to default',
  TOGGLE_EDIT: 'Toggle Edit mode on / off',
};

export const FETCH_PARMS = {
  mode: 'cors', // no-cors, *cors, same-origin
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  credentials: 'same-origin', // include, *same-origin, omit
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  redirect: 'follow', // manual, *follow, error
  referrerPolicy: 'no-referrer', // no-referrer, *client
};

export const POST_PARAMS = {
  method: 'POST',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  redirect: 'follow',
  referrerPolicy: 'no-referrer',
};

export const BINDER = '????!????---?????!?!???!';
