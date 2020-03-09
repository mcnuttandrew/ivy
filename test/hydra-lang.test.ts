import PolestarTemplate from '../src/templates/polestar-template';
import {
  applyConditionals,
  evaluateHydraProgram,
  constructDefaultTemplateMap,
  // backpropHydraProgram,
} from '../src/hydra-lang';
import {TemplateMap} from '../src/types';
import Scatterplot from '../src/templates/scatterplot';
import GALLERY from '../src/templates/gallery';
import produce from 'immer';

test('#applyConditionals', () => {
  const PARSED_CODE = JSON.parse(Scatterplot.code);

  const exampleTemplateMap1: TemplateMap = {
    paramValues: {Color: null},
    systemValues: {viewsToMaterialize: {}, dataTransforms: []},
  };
  expect(applyConditionals(exampleTemplateMap1)(PARSED_CODE)).toMatchSnapshot();

  const exampleTemplateMap2: TemplateMap = {
    paramValues: {Color: 'Wowza good dimension'},
    systemValues: {viewsToMaterialize: {}, dataTransforms: []},
  };
  expect(applyConditionals(exampleTemplateMap2)(PARSED_CODE)).toMatchSnapshot();
});

test('evaluateHydraProgram polestar template', () => {
  const templateMap = constructDefaultTemplateMap(PolestarTemplate);

  expect(evaluateHydraProgram(PolestarTemplate, templateMap)).toMatchSnapshot();
  const templateMap2 = produce(templateMap, draftState => {
    draftState.paramValues.X = '"GooD Dimension"';
    draftState.paramValues.XIncludeZero = 'false';
  });
  expect(evaluateHydraProgram(PolestarTemplate, templateMap2)).toMatchSnapshot();

  const templateMap3 = produce(templateMap, draftState => {
    draftState.paramValues.X = '"Origin"';
    draftState.paramValues.XType = '"nominal"';
    draftState.paramValues.ColorAggSimple = '"count"';
  });
  expect(evaluateHydraProgram(PolestarTemplate, templateMap3)).toMatchSnapshot();

  expect(
    evaluateHydraProgram(GALLERY, {
      paramValues: {
        dataTargetSearch: [],
        SearchKey: '"should result"',
      },
      systemValues: {viewsToMaterialize: {}, dataTransforms: []},
    }),
  ).toMatchSnapshot();
});
// const update1 = `
// {
//   "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
//   "mark": {"type": "point", "tooltip": true, "size": 15, "color": "steelblue"},
//   "encoding": {
//     "x": {"field": null, "type": "quantitative", "scale": {"zero": true}},
//     "y": {"field": null, "type": "quantitative", "scale": {"zero": true}},
//     "color": null
//   },
//   "height":
// }`;
// const update2 = `
// {
//   "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
//   "mark": {"type": "point", "tooltip": true, "size": 15, "color": "steelblue"},
//   "encoding": {
//     "x": {"field": null, "type": "quantitative", "scale": {"zero": true}},
//     "y": {"field": null, "type": "quantitative", "scale": {"zero": true}},
//     "color": null
//   },
//   "height": 300
// }`;
// const update3 = `
// {
//   "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
//   "mark": {"type": "point", "tooltip": true, "size": 15, "color": "steelblue"},
//   "encoding": {
//     "x": {"field": null, "type": "quantitative", "scale": {"zero": true}},
//     "y": {"field": "Cylinders", "type": "quantitative", "scale": {"zero": true}},
//     "color": null
//   },
//   "height": 300
// }`;
// test.only('#backpropHydraProgram', () => {
//   // const expectEqual = (a: string, b: string): void => expect(JSON.parse(a)).toEqual(JSON.parse(b));
//   const templateMap = constructDefaultTemplateMap(Scatterplot);

//   // no updates for invalid json
//   const result1 = backpropHydraProgram(Scatterplot, templateMap, update1);
//   expect(JSON.parse(result1.template.code)).toEqual(JSON.parse(Scatterplot.code));
//   expect(result1.templateMap).toEqual(templateMap);

//   // update the template where appropriate
//   const result2 = backpropHydraProgram(Scatterplot, templateMap, update2);
//   const withHeight = JSON.stringify({...JSON.parse(Scatterplot.code), height: 300});
//   expect(JSON.parse(result2.template.code)).toEqual(JSON.parse(withHeight));
//   expect(result2.templateMap).toEqual(templateMap);

//   // update the template where appropriate
//   const result3 = backpropHydraProgram(Scatterplot, templateMap, update3);
//   expect(JSON.parse(result3.template.code)).toEqual(JSON.parse(withHeight));
//   expect(result3.templateMap).toEqual({...templateMap, yDim: 'Cylinders'});
// });
