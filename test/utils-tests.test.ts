import {
  setTemplateValues,
  fillTemplateMapWithDefaults,
  recieveTemplates,
} from '../src/reducers/template-actions';
import {DEFAULT_TEMPLATES} from '../src/templates';
import SCATTERPLOT_TEMPLATE from '../src/templates/example-templates/scatterplot';
import PIECHART_TEMPLATE from '../src/templates/example-templates/pie-chart';
import TABLE from '../src/templates/example-templates/table';

import {DEFAULT_STATE} from '../src/reducers/default-state';
import {setEncodingMode} from '../src/reducers/gui-actions';

test('#setTemplateValues', () => {
  const filledOutPieTemplate = setTemplateValues(PIECHART_TEMPLATE.code, {
    category: '"CATEGORY_TEST"',
    value: '"VALUE_TEST"',
    sortValues: 'true',
  });
  expect(filledOutPieTemplate).toMatchSnapshot();

  const filledOutScatterTemplate = setTemplateValues(SCATTERPLOT_TEMPLATE.code, {
    xDim: '"xDim_TEST"',
    yDim: '"yDim_TEST"',
  });
  expect(filledOutScatterTemplate).toMatchSnapshot();

  const filledOutTableTemplate = setTemplateValues(TABLE.code, {
    columns: ['"xDim_TEST"', '"yDim_TEST"'],
  });
  expect(filledOutTableTemplate).toMatchSnapshot();
});

test('#fillTemplateMapWithDefaults', () => {
  const preparedState = setEncodingMode(recieveTemplates(DEFAULT_STATE, DEFAULT_TEMPLATES), 'Scatterplot');
  const newState = fillTemplateMapWithDefaults(preparedState);
  expect(newState.get('spec').toJS()).toMatchSnapshot();
  expect(newState.get('templateMap').toJS()).toMatchSnapshot();

  const nextState = fillTemplateMapWithDefaults(setEncodingMode(newState, 'pie chart'));
  expect(nextState.get('spec').toJS()).toMatchSnapshot();
  expect(nextState.get('templateMap').toJS()).toMatchSnapshot();

  const nextState2 = fillTemplateMapWithDefaults(setEncodingMode(newState, 'Data Table'));
  expect(nextState2.get('spec').toJS()).toMatchSnapshot();
  expect(nextState2.get('templateMap').toJS()).toMatchSnapshot();
});

// // UGH come back to this later
//
// // @ts-ignore
// import React from 'react';
// import {mount} from 'enzyme';
// import AppWrap from '../src/components/app-wrap';
//
// test('test mount', t => {
//   const $ = mount(<AppWrap />);
//   console.log($);
// });
