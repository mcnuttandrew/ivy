import React, {useEffect} from 'react';
import {HydraExtension, RendererProps, Template, Suggestion} from '../types';
import {walkTreeAndLookForFields, buildSynthesizer} from './suggestion-utils';
import UnitVis from 'unit-vis';

function UnitVisRenderer(props: RendererProps): JSX.Element {
  const {spec, data} = props;
  const specString = JSON.stringify(spec);
  useEffect(() => {
    let specCopy = null;
    try {
      specCopy = JSON.parse(specString);
    } catch (error) {
      console.log(error);
      return;
    }
    if (specString === '{}') {
      return;
    }
    specCopy.data = {values: data};
    const oldSvg = document.querySelector('#special-hydra-target svg');
    if (oldSvg) {
      oldSvg.remove();
    }
    if (spec) {
      try {
        // @ts-ignore
        UnitVis('special-hydra-target', specCopy);
      } catch (e) {
        console.log('UnitVis Crash', e);
      }
    }
  }, [specString]);

  return (
    <div>
      <div id="special-hydra-target" />
    </div>
  );
}

export const BLANK_TEMPLATE: Template = {
  templateAuthor: '',
  templateLanguage: 'unit-vis',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  code: JSON.stringify(
    {
      $schema: 'https://unit-vis.netlify.com/assets/unit-vis-schema.json',
      layouts: [],
      mark: {color: {key: '', type: 'categorical'}},
    },
    null,
    2,
  ),
  widgets: [],
};

function inferRemoveDataSuggestions(code: string, parsedCode: any): Suggestion[] {
  const suggestions = [];
  if (parsedCode.data && parsedCode.data.url) {
    suggestions.push({
      from: 'data url',
      to: '"name": "myData"',
      comment: 'remove specific data',
      simpleReplace: false,
      codeEffect: (code: string) => {
        const parsed = JSON.parse(code);
        delete parsed.data;
        return JSON.stringify(parsed, null, 2);
      },
    });
  }
  return suggestions;
}

const buildSuggestions = (spec: any): Set<string> =>
  walkTreeAndLookForFields((key: string) => key === 'key')(spec);

const UNIT_VIS_CONFIG: HydraExtension = {
  renderer: UnitVisRenderer,
  suggestion: buildSynthesizer(buildSuggestions, inferRemoveDataSuggestions),
  language: 'unit-vis',
  blankTemplate: BLANK_TEMPLATE,
};

export default UNIT_VIS_CONFIG;