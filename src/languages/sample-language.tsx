import React from 'react';
import {LanguageExtension, Template, RendererProps} from '../types';
export const BLANK_TEMPLATE: Template = {
  templateAuthor: '',
  templateLanguage: 'sample-lang',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  disallowFanOut: false,
  customCards: [],
  code: JSON.stringify({$schema: 'YOUR_LANG'}, null, 2),
  widgets: [],
};

function ExampleRenderer(props: RendererProps): JSX.Element {
  const {spec, data, onError} = props;
  return <div />;
}

const SampleLang: LanguageExtension = {
  language: 'sample-lang',
  blankTemplate: BLANK_TEMPLATE,
  suggestion: () => [],
  renderer: ExampleRenderer,
  getDataViews: () => Promise.resolve([]),
};

export default SampleLang;
