import React from 'react';
import {Provider} from 'react-redux';

import * as actionCreators from '../actions/index';
import setUpState from '../reducers/index';
import Root, {mapStateToProps} from './root';
import ErrorBoundary from './error-boundary';
import DEFAULT_LANGUAGES from '../languages/default-languages';
export default function AppWrap(): JSX.Element {
  // necessary footwork to appease typescript across the initial load
  const store = setUpState();
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Root {...actionCreators} {...mapStateToProps(store.getState())} languages={DEFAULT_LANGUAGES} />
      </Provider>
    </ErrorBoundary>
  );
}
