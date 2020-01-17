import {IsotypeBarChart} from './text-examples';
import {synthesizeSuggestions, takeSuggestion} from '../src/utils/introspect';

test('#synthesizeSuggestions', () => {
  const suggestions = synthesizeSuggestions(IsotypeBarChart, []);
  expect(suggestions).toMatchSnapshot();
  // remove the foreign data
  const newCode = takeSuggestion(IsotypeBarChart, suggestions[3]);
  const suggestions2 = synthesizeSuggestions(newCode, []);
  expect(suggestions2).toMatchSnapshot();

  const newCod2 = takeSuggestion(newCode, suggestions2[2]);
  const widget = suggestions2[2].sideEffect();
  const widgets = [widget];
  const suggestions3 = synthesizeSuggestions(newCod2, widgets);
  expect(suggestions3).toMatchSnapshot();
});
