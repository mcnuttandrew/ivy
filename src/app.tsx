import React from 'react';
import ReactDOM from 'react-dom';
import AppWrap from './components/app-wrap';
import setupMonaco from './utils/monaco';
import {PREVENT_ACCIDENTAL_LEAVE} from './constants/CONFIG';
import {retrieveThumbnails} from './thumbnail';

import './stylesheets/main.css';
import './stylesheets/rc-slider.css';
import 'rc-tooltip/assets/bootstrap_white.css';

setupMonaco();
retrieveThumbnails();

ReactDOM.render(<AppWrap />, document.querySelector('#root-container'));
if (document.querySelector('.loading-msg')) {
  document.querySelector('.loading-msg').remove();
}

if (PREVENT_ACCIDENTAL_LEAVE) {
  window.onbeforeunload = (): string => 'Are you sure you want to leave?';
}
