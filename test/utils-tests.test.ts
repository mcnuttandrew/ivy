import {
  setTemplateValues,
  fillTemplateMapWithDefaults,
  recieveTemplates,
} from '../src/reducers/template-actions';
import {DEFAULT_TEMPLATES} from '../src/constants/templates';
import SCATTERPLOT_TEMPLATE from '../src/constants/example-templates/scatterplot';
import PIECHART_TEMPLATE from '../src/constants/example-templates/pie-chart';

import {DEFAULT_STATE} from '../src/reducers/default-state';

test('#setTemplateValues', () => {
  const filledOutPieTemplate = setTemplateValues(PIECHART_TEMPLATE.code, {
    category: '"CATEGORY_TEST"',
    value: '"VALUE_TEST"',
    sortValues: 'true',
  });
  expect(filledOutPieTemplate).toMatchSnapshot();

  const filledOutScatterTemplate = setTemplateValues(
    SCATTERPLOT_TEMPLATE.code,
    {
      xDim: '"xDim_TEST"',
      yDim: '"yDim_TEST"',
    },
  );
  expect(filledOutScatterTemplate).toMatchSnapshot();
});

test('#fillTemplateMapWithDefaults', () => {
  const preparedState = recieveTemplates(DEFAULT_STATE, DEFAULT_TEMPLATES).set(
    'encodingMode',
    'scatterplot',
  );
  const newState = fillTemplateMapWithDefaults(preparedState);
  expect(newState.get('spec').toJS()).toMatchSnapshot();
  expect(newState.get('templateMap').toJS()).toMatchSnapshot();

  const nextState = fillTemplateMapWithDefaults(
    newState.set('encodingMode', 'pie chart'),
  );
  expect(nextState.get('spec').toJS()).toMatchSnapshot();
  expect(nextState.get('templateMap').toJS()).toMatchSnapshot();
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
