import {IsotypeBarChart, TITANTIC_ETC} from './text-examples';
import {DataType} from '../src/types';
import {takeSuggestion} from '../src/utils/index';
import VEGA_LITE from '../src/languages/vega-lite';
import UNIT_VIS from '../src/languages/unit-vis';

test('#synthesizeSuggestions happy path - IsotypeBarChart', () => {
  const synthesizeSuggestions = VEGA_LITE.suggestion;
  const suggestions = synthesizeSuggestions(IsotypeBarChart, [], []);
  expect(suggestions).toMatchSnapshot();
  // remove the foreign data
  const newCode = takeSuggestion(IsotypeBarChart, suggestions[3]);
  const suggestions2 = synthesizeSuggestions(newCode, [], []);
  expect(suggestions2).toMatchSnapshot();

  const newCod2 = takeSuggestion(newCode, suggestions2[2]);
  const widget = suggestions2[2].sideEffect();
  const widgets = [widget];
  const suggestions3 = synthesizeSuggestions(newCod2, widgets, []);
  expect(suggestions3).toMatchSnapshot();
});

test('#synthesizeSuggestions (remove data first) - IsotypeBarChart', () => {
  const synthesizeSuggestions = VEGA_LITE.suggestion;
  const suggestions = synthesizeSuggestions(IsotypeBarChart, [], []);
  expect(suggestions).toMatchSnapshot();
  // remove the foreign data
  const newCode = takeSuggestion(IsotypeBarChart, suggestions[0]);
  expect(newCode).toMatchSnapshot();
  const widget = suggestions[0].sideEffect();
  const widgets = [widget];
  // take a suggestion
  const suggestions2 = synthesizeSuggestions(newCode, widgets, [
    {
      field: 'animal',
      type: 'DIMENSION' as DataType,
      originalType: 'DIMENSION' as DataType,
      domain: [],
      summary: {},
    },
  ]);
  expect(suggestions2).toMatchSnapshot();
});

test('#synthesizeSuggestions - Titantic Etc', () => {
  const synthesizeSuggestions = UNIT_VIS.suggestion;
  const suggestions = synthesizeSuggestions(TITANTIC_ETC, [], []);
  expect(suggestions).toMatchSnapshot();
  // remove the foreign data
  const newCode = takeSuggestion(IsotypeBarChart, suggestions[0]);
  expect(newCode).toMatchSnapshot();
  const widget = suggestions[0].sideEffect();
  const widgets = [widget];
  // take a suggestion
  const suggestions2 = synthesizeSuggestions(newCode, widgets, []);
  expect(suggestions2).toMatchSnapshot();
});
