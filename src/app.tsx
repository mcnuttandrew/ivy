import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AppState from './reducers/index.ts';
import './stylesheets/main.css';
import Root from './components/root.tsx';

const appContainer = document.createElement('div');
appContainer.setAttribute('id', 'root-container');
const body = document.querySelector('body');
if (body) {
  body.appendChild(appContainer);

  ReactDOM.render(
    <Provider store={AppState}>
      <Root />
    </Provider>,
    document.querySelector('#root-container'),
  );
}
