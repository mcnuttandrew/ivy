import React from 'react';
import {Provider} from 'react-redux';

import setUpState from '../reducers/index';
import Root from './root';

export default function AppWrap() {
  return (
    <Provider store={setUpState()}>
      <Root />
    </Provider>
  );
}
