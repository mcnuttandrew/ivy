import {fillTemplateMapWithDefaults, recieveTemplates} from '../src/reducers/template-actions';
import {setTemplateValues} from '../src/ivy-lang';
import {DEFAULT_TEMPLATES} from '../src/templates';
import SCATTERPLOT_TEMPLATE from '../src/templates/scatterplot';
import PIECHART_TEMPLATE from '../src/templates/pie-chart';
import TABLE from '../src/templates/table';
import {WAFFLE_ISO} from './text-examples';

import {DEFAULT_STATE} from '../src/reducers';
import {setEncodingMode} from '../src/reducers/gui-actions';
import {evaluateIvyProgram} from '../src/ivy-lang';
import {serializeTemplate, deserializeTemplate} from '../src/utils/index';

const blankSystemValues = {systemValues: {viewsToMaterialize: {}, dataTransforms: [] as any[]}};

test('#setTemplateValues', () => {
  const filledOutPieTemplate = setTemplateValues(PIECHART_TEMPLATE.code, {
    paramValues: {category: '"CATEGORY_TEST"', value: '"VALUE_TEST"', sortValues: 'true'},
    ...blankSystemValues,
  });
  expect(filledOutPieTemplate).toMatchSnapshot();

  const filledOutScatterTemplate = setTemplateValues(SCATTERPLOT_TEMPLATE.code, {
    paramValues: {xDim: '"xDim_TEST"', yDim: '"yDim_TEST"'},
    ...blankSystemValues,
  });
  expect(filledOutScatterTemplate).toMatchSnapshot();

  const filledOutTableTemplate = setTemplateValues(TABLE.code, {
    paramValues: {columns: ['"xDim_TEST"', '"yDim_TEST"']},
    ...blankSystemValues,
  });
  expect(filledOutTableTemplate).toMatchSnapshot();

  const filledOutTemplatenext = setTemplateValues(WAFFLE_ISO, {
    paramValues: {ChartSize: '400', Color: 'Example', columnSize: '5', Scheme: '"set1"', size: '60'},
    ...blankSystemValues,
  });
  expect(filledOutTemplatenext).toMatchSnapshot();
});

test('#fillTemplateMapWithDefaults', () => {
  const preparedState = setEncodingMode(recieveTemplates(DEFAULT_STATE, DEFAULT_TEMPLATES), 'Scatterplot');
  const newState = fillTemplateMapWithDefaults(preparedState);
  expect(evaluateIvyProgram(newState.currentTemplateInstance, newState.templateMap)).toMatchSnapshot();
  expect(newState.templateMap).toMatchSnapshot();

  const nextState = fillTemplateMapWithDefaults(setEncodingMode(newState, 'pie chart'));
  expect(evaluateIvyProgram(nextState.currentTemplateInstance, nextState.templateMap)).toMatchSnapshot();
  expect(nextState.templateMap).toMatchSnapshot();

  const nextState2 = fillTemplateMapWithDefaults(setEncodingMode(newState, 'Data Table'));
  expect(evaluateIvyProgram(nextState2.currentTemplateInstance, nextState2.templateMap)).toMatchSnapshot();
  expect(nextState2.templateMap).toMatchSnapshot();
});

test('serialize/deserialize template', () => {
  expect(serializeTemplate(PIECHART_TEMPLATE)).toMatchSnapshot();
  expect(deserializeTemplate(serializeTemplate(PIECHART_TEMPLATE))).toMatchSnapshot();
});
