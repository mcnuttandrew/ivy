import {SetTemplateValuePayload} from '../actions';
import {
  ColumnHeader,
  LanguageExtension,
  ListWidget,
  RendererProps,
  Suggestion,
  Template,
  TemplateMap,
} from '../types';
import {buildSynthesizer, walkTreeAndLookForFields, difference} from './suggestion-utils';
import stringify from 'json-stringify-pretty-compact';

import React from 'react';
import {Vega} from 'react-vega';
import * as vega from 'vega';

import {Handler} from 'vega-tooltip';
import {get, trim} from '../utils';

import {parse, View} from 'vega';
import {compile} from 'vega-lite';

function getDataViews(props: RendererProps): Promise<any> {
  const {spec, data} = props;
  const finalSpec = JSON.parse(JSON.stringify(spec));

  if (
    !get(finalSpec, ['data', 'values']) &&
    !get(finalSpec, ['data', 'url']) &&
    !get(finalSpec, ['data', 'sequence']) &&
    !get(finalSpec, ['data', 'layer'])
  ) {
    finalSpec.data = {values: data};
  }
  const view = new View(parse(compile(finalSpec).spec), {}).initialize();
  return view
    .runAsync()
    .then(() => view.getState({signals: vega.falsy, data: vega.truthy, recurse: true}).data);
}

function VegaLiteRenderer(props: RendererProps): JSX.Element {
  const {spec, data, onError} = props;
  const finalSpec = JSON.parse(JSON.stringify(spec));

  if (
    !get(finalSpec, ['data', 'values']) &&
    !get(finalSpec, ['data', 'url']) &&
    !get(finalSpec, ['data', 'sequence'])
  ) {
    finalSpec.data = {values: data};
  }
  return (
    <Vega
      actions={true}
      renderer="canvas"
      onError={onError}
      spec={finalSpec}
      mode="vega-lite"
      tooltip={new Handler({}).call}
    />
  );
}

function listFind(val: string): (d: {display: string; value: string} | string) => boolean {
  return (d): boolean => (typeof d === 'string' ? d : d.display) === val;
}
/**
 * Templates that use vega-lite often follow a specific pattern which we can usually guess some pieces of
 * This function checks the type a column thats being inserted and trys to intelligently set the type
 * of the associated channel as best it can
 * @param template
 * @param payload
 * @param templateMap
 * @param columns
 */
export function tryToGuessTheTypeForVegaLite(
  template: Template,
  payload: SetTemplateValuePayload,
  templateMap: TemplateMap,
  columns: ColumnHeader[],
): void {
  if (template.templateLanguage !== 'vega-lite') {
    return;
  }
  const typeWidget = template.widgets.find(widget => widget.name === `${payload.field}Type`);
  if (!(typeWidget && payload.type === 'DataTarget')) {
    return;
  }
  const column = columns.find(col => col.field === trim(payload.text as string));
  const dims = (typeWidget.config as ListWidget).allowedValues;

  if (column && column.type === 'DIMENSION' && dims.find(listFind('nominal'))) {
    templateMap.paramValues[`${payload.field}Type`] = '"nominal"';
  }

  if (column && column.type === 'MEASURE' && dims.find(listFind('quantitative'))) {
    templateMap.paramValues[`${payload.field}Type`] = '"quantitative"';
  }

  if (column && column.type === 'TIME' && dims.find(listFind('temporal'))) {
    templateMap.paramValues[`${payload.field}Type`] = '"temporal"';
  }
}

const vegaLiteEmpty: any = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  mark: {type: 'point', tooltip: true},
  encoding: {},
};
export const BLANK_TEMPLATE: Template = {
  templateAuthor: '',
  templateLanguage: 'vega-lite',
  templateName: 'BLANK TEMPLATE',
  templateDescription: 'FILL IN DESCRIPTION',
  disallowFanOut: false,
  customCards: [],
  code: JSON.stringify(vegaLiteEmpty, null, 2),
  widgets: [],
};

function inferPossibleDataTargets(spec: any): Set<string> {
  const possibleFields = new Set(['field', 'row', 'column']);
  const foundFields = walkTreeAndLookForFields((key: string) => possibleFields.has(key))(spec);
  const generatedFields = walkTreeAndLookForFields((key: string) => key === 'as')(spec);
  return difference(foundFields, generatedFields);
}

function inferRemoveDataSuggestions(code: string, parsedCode: any): Suggestion[] {
  const suggestions = [];
  // check to see if the values that are in the code are specifically defined
  const hasUrl = get(parsedCode, ['data', 'url']);
  const hasValues = get(parsedCode, ['data', 'values']);
  if (hasUrl || hasValues) {
    suggestions.push({
      from: 'data url',
      to: '"name": "myData"',
      comment: 'Remove Specific data',
      simpleReplace: false,
      codeEffect: (code: string) => {
        const parsed = JSON.parse(code);
        if (hasUrl) {
          delete parsed.data.url;
        }
        if (hasValues) {
          delete parsed.data.values;
        }
        parsed.data.name = 'myData';
        return stringify(parsed);
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

const VEGA_LITE_CONFIG: LanguageExtension = {
  renderer: VegaLiteRenderer,
  suggestion: buildSynthesizer(inferPossibleDataTargets, inferRemoveDataSuggestions),
  language: 'vega-lite',
  blankTemplate: BLANK_TEMPLATE,
  getDataViews,
};
export default VEGA_LITE_CONFIG;
