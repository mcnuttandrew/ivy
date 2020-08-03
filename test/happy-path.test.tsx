import React from 'react';
import {mount} from 'enzyme';
import AppWrap from '../src/components/app-wrap';

test('Happy path', done => {
  const $ = mount(<AppWrap />);
  // should find the home page rendered as expected
  expect($.find('.home-container-contents').text()).toMatchSnapshot();
  // should find the expected number of default templates
  expect($.find('.home-template-row').length).toBe(9);
  // click on the polestar template
  $.find('.Ivy-Authors-Polestar a')
    .first()
    .simulate('click', {button: 0});

  // setTimeout(() => {
  // console.log($.text());
  // the text of the encoding column should render as expected
  expect($.find('.encoding-column').text()).toMatchSnapshot();
  // the text of the data column should render as expected
  expect($.find('.column.background-2').text()).toMatchSnapshot();
  // the chart area should hvae the default charts loaded
  expect($.find('.chart-container').text()).toMatchSnapshot();
  done();
  // }, 5000);
});
