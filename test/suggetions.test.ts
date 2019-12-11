import {List} from 'immutable';
import {IsotypeBarChart} from './text-examples';
import {synthesizeSuggestions, takeSuggestion} from '../src/utils/introspect';
import {TemplateWidget} from '../src/templates/types';

test('#synthesizeSuggestions', () => {
  const suggestions = synthesizeSuggestions(IsotypeBarChart, List());
  expect(suggestions).toMatchSnapshot();
  // remove the foreign data
  const newCode = takeSuggestion(IsotypeBarChart, suggestions[3]);
  const suggestions2 = synthesizeSuggestions(newCode, List());
  expect(suggestions2).toMatchSnapshot();

  const newCod2 = takeSuggestion(newCode, suggestions2[2]);
  // @ts-ignore
  const widget = suggestions2[2].sideEffect();
  // @ts-ignore
  const widgets: List<TemplateWidget> = List().push(widget);
  const suggestions3 = synthesizeSuggestions(newCod2, widgets);
  expect(suggestions3).toMatchSnapshot();
});
