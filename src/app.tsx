import React from 'react';
import ReactDOM from 'react-dom';
import AppWrap from './components/app-wrap';

import './stylesheets/main.css';
import './stylesheets/rc-slider.css';

const appContainer = document.createElement('div');
appContainer.setAttribute('id', 'root-container');
const body = document.querySelector('body');
if (body) {
  body.appendChild(appContainer);

  ReactDOM.render(<AppWrap />, document.querySelector('#root-container'));
}
