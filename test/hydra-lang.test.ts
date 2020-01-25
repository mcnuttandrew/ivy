import PolestarTemplate from '../src/templates/example-templates/polestar-template';
import {applyConditionals, evaluateHydraProgram, constructDefaultTemplateMap} from '../src/hydra-lang';
import Scatterplot from '../src/templates/example-templates/scatterplot';
import produce from 'immer';

test('#applyConditionals', () => {
  const PARSED_CODE = JSON.parse(Scatterplot.code);

  const exampleTemplateMap1: any = {Color: null};
  expect(applyConditionals(exampleTemplateMap1)(PARSED_CODE)).toMatchSnapshot();

  const exampleTemplateMap2: any = {Color: 'Wowza good dimension'};
  expect(applyConditionals(exampleTemplateMap2)(PARSED_CODE)).toMatchSnapshot();
});

test('evaluateHydraProgram polestar template', () => {
  const templateMap = constructDefaultTemplateMap(PolestarTemplate);

  expect(evaluateHydraProgram(PolestarTemplate, templateMap)).toMatchSnapshot();
  const templateMap2 = produce(templateMap, draftState => {
    draftState.X = '"GooD Dimension"';
    draftState.XIncludeZero = 'false';
  });
  expect(evaluateHydraProgram(PolestarTemplate, templateMap2)).toMatchSnapshot();
});
