import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AppState from './reducers/index';
import './stylesheets/main.css';
import './stylesheets/rc-slider.css';

import Root from './components/root';

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
