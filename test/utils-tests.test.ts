import {fillTemplateMapWithDefaults, recieveTemplates} from '../src/reducers/template-actions';
import {setTemplateValues} from '../src/hydra-lang';
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
  expect(newState.spec).toMatchSnapshot();
  expect(newState.templateMap).toMatchSnapshot();

  const nextState = fillTemplateMapWithDefaults(setEncodingMode(newState, 'pie chart'));
  expect(nextState.spec).toMatchSnapshot();
  expect(nextState.templateMap).toMatchSnapshot();

  const nextState2 = fillTemplateMapWithDefaults(setEncodingMode(newState, 'Data Table'));
  expect(nextState2.spec).toMatchSnapshot();
  expect(nextState2.templateMap).toMatchSnapshot();
});
