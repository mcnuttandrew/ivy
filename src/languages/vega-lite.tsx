import {SetTemplateValuePayload} from '../actions';
import {
  ColumnHeader,
  HydraExtension,
  ListWidget,
  RendererProps,
  Suggestion,
  Template,
  TemplateMap,
} from '../types';
import {buildSynthesizer, walkTreeAndLookForFields, difference} from './suggestion-utils';

import React from 'react';
import {Vega} from 'react-vega';

import {Handler} from 'vega-tooltip';
import {get, trim} from '../utils';

function VegaLiteRenderer(props: RendererProps): JSX.Element {
  const {spec, data, onError} = props;
  const finalSpec = JSON.parse(JSON.stringify(spec));

  if (!get(finalSpec, ['data', 'values']) && !get(finalSpec, ['data', 'sequence'])) {
    finalSpec.data = {values: data};
  }
  return (
    <Vega
      actions={false}
      onError={onError}
      spec={finalSpec}
      mode="vega-lite"
      tooltip={new Handler({}).call}
    />
  );
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

  if (column && column.type === 'DIMENSION' && dims.find(d => d.display === 'nominal')) {
    templateMap.paramValues[`${payload.field}Type`] = '"nominal"';
  }

  if (column && column.type === 'MEASURE' && dims.find(d => d.display === 'quantitative')) {
    templateMap.paramValues[`${payload.field}Type`] = '"quantitative"';
  }

  if (column && column.type === 'TIME' && dims.find(d => d.display === 'temporal')) {
    templateMap.paramValues[`${payload.field}Type`] = '"temporal"';
  }
}

const vegaLiteEmpty: any = {
  $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
  transform: [] as any[],
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
  const foundFields = walkTreeAndLookForFields((key: string) => key === 'field')(spec);
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
        return JSON.stringify(parsed, null, 2);
      },
    });
  }
  return suggestions;
}

const VEGA_LITE_CONFIG: HydraExtension = {
  renderer: VegaLiteRenderer,
  suggestion: buildSynthesizer(inferPossibleDataTargets, inferRemoveDataSuggestions),
  language: 'vega-lite',
  blankTemplate: BLANK_TEMPLATE,
};
export default VEGA_LITE_CONFIG;
