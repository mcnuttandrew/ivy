// UGH come back to this later

// @ts-ignore
import React from 'react';
import {mount} from 'enzyme';
import {Provider} from 'react-redux';

import setUpState from '../src/reducers/index';
import Root from '../src/components/root';

// @ts-ignore
import tape from 'tape';

tape('test mount', t => {
  const $ = mount(
    <Provider store={setUpState()}>
      <Root />
    </Provider>,
  );
  console.log($);
  t.end();
});
