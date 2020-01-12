import React from 'react';
import {Provider} from 'react-redux';

import * as actionCreators from '../actions/index';
import setUpState from '../reducers/index';
import Root, {mapStateToProps} from './root';

export default function AppWrap(): JSX.Element {
  // necessary footwork to appease typescript across the initial load
  const store = setUpState();
  return (
    <Provider store={store}>
      <Root {...actionCreators} {...mapStateToProps(store.getState())} />
    </Provider>
  );
}
