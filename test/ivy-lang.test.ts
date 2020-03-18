import PolestarTemplate from '../src/templates/polestar-template';
import {
  applyConditionals,
  evaluateIvyProgram,
  constructDefaultTemplateMap,
  // backpropIvyProgram,
} from '../src/ivy-lang';
import {TemplateMap} from '../src/types';
import Scatterplot from '../src/templates/scatterplot';
import GALLERY from '../src/templates/gallery';
import produce from 'immer';
const blankSystemValues = {systemValues: {viewsToMaterialize: {}, dataTransforms: [] as any[]}};
test('#applyConditionals', () => {
  const PARSED_CODE = JSON.parse(Scatterplot.code);

  const exampleTemplateMap1: TemplateMap = {paramValues: {Color: null}, ...blankSystemValues};
  expect(applyConditionals(exampleTemplateMap1)(PARSED_CODE)).toMatchSnapshot();

  const exampleTemplateMap2: TemplateMap = {
    paramValues: {Color: 'Wowza good dimension'},
    ...blankSystemValues,
  };
  expect(applyConditionals(exampleTemplateMap2)(PARSED_CODE)).toMatchSnapshot();
});

test('evaluateIvyProgram polestar template', () => {
  const templateMap = constructDefaultTemplateMap(PolestarTemplate);

  expect(evaluateIvyProgram(PolestarTemplate, templateMap)).toMatchSnapshot();
  const templateMap2 = produce(templateMap, draftState => {
    draftState.paramValues.X = '"GooD Dimension"';
    draftState.paramValues.XIncludeZero = 'false';
  });
  expect(evaluateIvyProgram(PolestarTemplate, templateMap2)).toMatchSnapshot();

  const templateMap3 = produce(templateMap, draftState => {
    draftState.paramValues.X = '"Origin"';
    draftState.paramValues.XType = '"nominal"';
    draftState.paramValues.ColorAggSimple = '"count"';
  });
  expect(evaluateIvyProgram(PolestarTemplate, templateMap3)).toMatchSnapshot();

  expect(
    evaluateIvyProgram(GALLERY, {
      paramValues: {dataTargetSearch: [], SearchKey: '"should result"'},
      ...blankSystemValues,
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
// test.only('#backpropIvyProgram', () => {
//   // const expectEqual = (a: string, b: string): void => expect(JSON.parse(a)).toEqual(JSON.parse(b));
//   const templateMap = constructDefaultTemplateMap(Scatterplot);

//   // no updates for invalid json
//   const result1 = backpropIvyProgram(Scatterplot, templateMap, update1);
//   expect(JSON.parse(result1.template.code)).toEqual(JSON.parse(Scatterplot.code));
//   expect(result1.templateMap).toEqual(templateMap);

//   // update the template where appropriate
//   const result2 = backpropIvyProgram(Scatterplot, templateMap, update2);
//   const withHeight = JSON.stringify({...JSON.parse(Scatterplot.code), height: 300});
//   expect(JSON.parse(result2.template.code)).toEqual(JSON.parse(withHeight));
//   expect(result2.templateMap).toEqual(templateMap);

//   // update the template where appropriate
//   const result3 = backpropIvyProgram(Scatterplot, templateMap, update3);
//   expect(JSON.parse(result3.template.code)).toEqual(JSON.parse(withHeight));
//   expect(result3.templateMap).toEqual({...templateMap, yDim: 'Cylinders'});
// });
