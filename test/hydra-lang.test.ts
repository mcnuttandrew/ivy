import {applyConditionals} from '../src/hydra-lang';
import Scatterplot from '../src/templates/example-templates/scatterplot';

test('#applyConditionals', () => {
  const PARSED_CODE = JSON.parse(Scatterplot.code);

  const exampleTemplateMap1: any = {Color: null};
  expect(applyConditionals(PARSED_CODE, exampleTemplateMap1)).toMatchSnapshot();

  const exampleTemplateMap2: any = {Color: 'Wowza good dimension'};
  expect(applyConditionals(PARSED_CODE, exampleTemplateMap2)).toMatchSnapshot();
});
