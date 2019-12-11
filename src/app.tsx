import React from 'react';
import ReactDOM from 'react-dom';
import AppWrap from './components/app-wrap';
import setupMonaco from './utils/monaco';
import {PREVENT_ACCIDENTAL_LEAVE} from './constants/CONFIG';

import './stylesheets/main.css';
import './stylesheets/rc-slider.css';

setupMonaco();

const appContainer = document.createElement('div');
appContainer.setAttribute('id', 'root-container');
const body = document.querySelector('body');
if (body) {
  body.appendChild(appContainer);

  ReactDOM.render(<AppWrap />, document.querySelector('#root-container'));
}

// TODO make this be enable on public builds
if (PREVENT_ACCIDENTAL_LEAVE) {
  window.onbeforeunload = function() {
    return 'Are you sure you want to leave?';
  };
}
