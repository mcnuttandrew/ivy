import React from 'react';
import {Provider} from 'react-redux';

import * as actionCreators from '../actions/index';
import setUpState from '../reducers/index';
import Editor, {mapStateToProps as EditorMapStateToProps} from '../containers/editor';
import Home, {mapStateToProps as HomeMapStateToProps} from '../containers/home';
import Docs, {mapStateToProps as DocsMapStateToProps} from '../containers/docs';
import ErrorBoundary from './error-boundary';
import DEFAULT_LANGUAGES from '../languages';
import {HashRouter as Router, Route, Switch} from 'react-router-dom';

export default function AppWrap(): JSX.Element {
  // necessary footwork to appease typescript across the initial load
  const store = setUpState();
  return (
    <ErrorBoundary>
      <Router>
        <Provider store={store}>
          <Switch>
            <Route path="/editor/:templateAuthor/:templateName/:templateInstance">
              <Editor
                {...actionCreators}
                {...EditorMapStateToProps(store.getState())}
                languages={DEFAULT_LANGUAGES}
              />
            </Route>
            <Route path="/editor/:templateAuthor/:templateName">
              <Editor
                {...actionCreators}
                {...EditorMapStateToProps(store.getState())}
                languages={DEFAULT_LANGUAGES}
              />
            </Route>
            <Route path="/editor/:specialRoute">
              <Editor
                {...actionCreators}
                {...EditorMapStateToProps(store.getState())}
                languages={DEFAULT_LANGUAGES}
              />
            </Route>
            <Route path="/editor">
              <Editor
                {...actionCreators}
                {...EditorMapStateToProps(store.getState())}
                languages={DEFAULT_LANGUAGES}
              />
            </Route>
            <Route path="/docs">
              <Docs {...actionCreators} {...DocsMapStateToProps()} languages={DEFAULT_LANGUAGES} />
            </Route>
            <Route path="/">
              <Home {...actionCreators} {...HomeMapStateToProps(store.getState())} />
            </Route>
          </Switch>
        </Provider>
      </Router>
    </ErrorBoundary>
  );
}
