import React, {useEffect} from 'react';
import {LanguageExtension, RendererProps, Template, Suggestion} from '../types';
import {log} from '../utils';
import {walkTreeAndLookForFields, buildSynthesizer} from './suggestion-utils';
import stringify from '../utils/stringify';
import UnitVis from 'unit-vis';

const QUERY_KEY = 'atom-key-special-container';
function UnitVisRenderer(props: RendererProps): JSX.Element {
  const {spec, data} = props;
  const specString = JSON.stringify(spec);
  useEffect(() => {
    let specCopy = null;
    try {
      specCopy = JSON.parse(specString);
    } catch (error) {
      log(error);
      return;
    }
    if (specString === '{}') {
      return;
    }
    specCopy.data = {values: data};
    const oldSvg = document.querySelector(`#${QUERY_KEY} svg`);
    if (oldSvg) {
      oldSvg.remove();
    }
    if (spec) {
      try {
        // @ts-ignore
        UnitVis(QUERY_KEY, specCopy);
      } catch (e) {
        log('UnitVis Crash', e);
      }
    }
  }, [specString]);

  return (
    <div>
      <div id={QUERY_KEY} />
    </div>
  );
}

export const BLANK_TEMPLATE: Template = {
  templateAuthor: '',
  templateLanguage: 'unit-vis',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  disallowFanOut: false,
  customCards: [],
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

const buildSuggestions = (spec: any): Set<string> =>
  walkTreeAndLookForFields((key: string) => key === 'key')(spec);

const UNIT_VIS_CONFIG: LanguageExtension = {
  renderer: UnitVisRenderer,
  suggestion: buildSynthesizer(buildSuggestions, inferRemoveDataSuggestions),
  language: 'unit-vis',
  getDataViews: () => Promise.resolve([]),
  blankTemplate: BLANK_TEMPLATE,
};

export default UNIT_VIS_CONFIG;
