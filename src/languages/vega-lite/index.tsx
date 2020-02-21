import {SetTemplateValuePayload} from '../../actions';
import {HydraExtension, RendererProps, Template, TemplateMap, ColumnHeader, ListWidget} from '../../types';
import {synthesizeSuggestions} from './suggestions';

import React from 'react';
import {Vega} from 'react-vega';

import {Handler} from 'vega-tooltip';
import {get, trim} from '../../utils';

// This componenent has the simple task of disallowing renders other than when the spec has changed
// in effect it is a modest caching layer. It also allows us to obscure some of the odities of the vega interface
// export default class VegaWrapper extends React.Component<VegaWrapperProps> {
//   shouldComponentUpdate(nextProps: VegaWrapperProps): boolean {
//     // TODO to memoize
//     return JSON.stringify(this.props.spec) !== JSON.stringify(nextProps.spec);
//   }

// }
function VegaLiteRenderer(props: RendererProps): JSX.Element {
  const {spec, data, onError} = props;
  const finalSpec = JSON.parse(JSON.stringify(spec));

  if (!get(finalSpec, ['data', 'values'])) {
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
  code: JSON.stringify(vegaLiteEmpty, null, 2),
  widgets: [],
};

const VEGA_LITE_CONFIG: HydraExtension = {
  renderer: VegaLiteRenderer,
  suggestion: synthesizeSuggestions,
  language: 'vega-lite',
  blankTemplate: BLANK_TEMPLATE,
};

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
    templateMap[`${payload.field}Type`] = '"nominal"';
  }

  if (column && column.type === 'MEASURE' && dims.find(d => d.display === 'quantitative')) {
    templateMap[`${payload.field}Type`] = '"quantitative"';
  }

  if (column && column.type === 'TIME' && dims.find(d => d.display === 'temporal')) {
    templateMap[`${payload.field}Type`] = '"temporal"';
  }
}

export default VEGA_LITE_CONFIG;
