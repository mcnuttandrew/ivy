import React from 'react';
import {connect} from 'react-redux';

import {GlobalHotKeys} from 'react-hotkeys';

import {HOT_KEYS} from '../constants/index';
import * as actionCreators from '../actions/index';

import {DataRow, ActionUser} from '../actions/index';
import {log} from '../utils';

import {AppState, Template, ViewCatalog} from '../types';

interface RootProps extends ActionUser {
  canRedo: boolean;
  canUndo: boolean;
  data: DataRow[];
  openModal: string | null;
  templateSaveState: string;
  templates: Template[];
  userName: string;
  views: string[];
  viewCatalog: ViewCatalog;
}

function HotKeyProvider(props: RootProps): JSX.Element {
  const {canRedo, canUndo, fillTemplateMapWithDefaults, openModal, setModalState, triggerRedo, triggerUndo} =
    props;
  const withSay = (func: any, name: string) => (): any => {
    log('hotkey', name);
    func();
  };
  return (
    // @ts-ignore
    <GlobalHotKeys
      keyMap={{...HOT_KEYS, USER_PANEL: 'u+p'}}
      handlers={{
        CLEAR_ENCODING: withSay(() => fillTemplateMapWithDefaults(), 'clear'),
        UNDO: withSay(() => canUndo && triggerUndo(), 'undo'),
        REDO: withSay(() => canRedo && triggerRedo(), 'redo'),
        CLOSE_MODALS: withSay(() => {
          if (openModal) {
            setModalState(null);
          }
        }, 'close modals'),
        USER_PANEL: withSay(() => {
          setModalState('user');
        }, 'user panel'),
      }}
      allowChanges={true}
    />
  );
}

export function mapStateToProps({base}: {base: AppState}): any {
  return {
    canRedo: base.redoStack.length >= 1,
    canUndo: base.undoStack.length >= 1,
  };
}

export default connect(mapStateToProps, actionCreators)(HotKeyProvider);
