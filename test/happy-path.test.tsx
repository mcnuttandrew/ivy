import React from 'react';
import {mount} from 'enzyme';
import AppWrap from '../src/components/app-wrap';

test('Happy path', () => {
  const $ = mount(<AppWrap />);
  // the text of the encoding column should render as expected
  expect($.find('.encoding-column').text()).toMatchSnapshot();
  // the text of the data column should render as expected
  expect($.find('.column.background-2').text()).toMatchSnapshot();
  // the chart area should hvae the default charts loaded
  expect($.find('.chart-container').text()).toMatchSnapshot();
});
