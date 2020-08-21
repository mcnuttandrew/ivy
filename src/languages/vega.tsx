import {LanguageExtension} from '../types';
import stringify from 'json-stringify-pretty-compact';
import x from 'vega-projection-extended';
// necessary footwork to force the projections to be imported
// eslint-disable-next-line
const yx = x;

import React from 'react';
import {Vega} from 'react-vega';
import {RendererProps, Template, Suggestion} from '../types';
import {Handler} from 'vega-tooltip';
import {buildSynthesizer} from './suggestion-utils';

import * as vega from 'vega';
import {parse, View} from 'vega';

function getDataViews(props: RendererProps): Promise<any> {
  const {spec, data} = props;
  return new Promise((resolve, reject) => {
    const finalSpec = JSON.parse(JSON.stringify(spec));

    // this stratagey only supports one data set
    (finalSpec.data || []).forEach((row: any, idx: number) => {
      if (row.values === 'myData') {
        finalSpec.data[idx].values = data;
      }
    });
    try {
      const view = new View(parse(finalSpec, {})).initialize();
      view.runAsync().then(() => {
        resolve(
          view.getState({
            signals: vega.falsy,
            data: vega.truthy,
            recurse: true,
          }).data,
        );
      });
    } catch (err) {
      reject(err);
    }
  });
}

function VegaRenderer(props: RendererProps): JSX.Element {
  const {spec, data, onError} = props;
  const finalSpec = JSON.parse(JSON.stringify(spec));

  // this stratagey only supports one data set
  (finalSpec.data || []).forEach((row: any, idx: number) => {
    if (row.values === 'myData') {
      finalSpec.data[idx].values = data;
    }
  });

  // renderer="svg"
  return (
    <Vega actions={false} onError={onError} spec={finalSpec} mode="vega" tooltip={new Handler({}).call} />
  );
}

const vegaEmpty: any = {
  $schema: 'https://vega.github.io/schema/vega/v5.json',
  width: 400,
  height: 200,
  padding: 5,
  data: [],
  signals: [],
  scales: [],
  axes: [],
  marks: [],
};
export const BLANK_TEMPLATE: Template = {
  templateAuthor: '',
  templateLanguage: 'vega',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  disallowFanOut: false,
  customCards: [],
  code: JSON.stringify(vegaEmpty, null, 2),
  widgets: [],
};

function inferRemoveDataSuggestions(code: string, parsedCode: any): Suggestion[] {
  const suggestions = [];
  if (Array.isArray(parsedCode.data) && parsedCode.data.find((d: any) => d.values)) {
    const idx = parsedCode.data.findIndex((d: any) => d.values);
    suggestions.push({
      from: 'data url',
      to: '"name": "myData"',
      comment: 'remove specific data',
      simpleReplace: false,
      codeEffect: (code: string) => {
        const parsed = JSON.parse(code);
        parsed.data[idx].values = 'myData';
        return stringify(parsed, {maxLength: 110});
      },
    });
  }
  const cleanedString = stringify(JSON.parse(code), {maxLength: 110}).trim();
  if (cleanedString !== code.trim()) {
    suggestions.push({
      from: 'unclean',
      to: 'clean',
      comment: 'Clean up code',
      simpleReplace: false,
      codeEffect: (): string => cleanedString,
    });
  }
  return suggestions;
}

const VEGA: LanguageExtension = {
  renderer: VegaRenderer,
  suggestion: buildSynthesizer(() => new Set(), inferRemoveDataSuggestions),
  language: 'vega',
  getDataViews,
  blankTemplate: BLANK_TEMPLATE,
};

export default VEGA;
