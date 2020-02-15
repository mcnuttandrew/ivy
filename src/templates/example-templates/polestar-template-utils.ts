import {
  DataTargetWidget,
  DataType,
  ListWidget,
  MultiDataTargetWidget,
  SectionWidget,
  SwitchWidget,
  TemplateWidget,
  TextWidget,
  Validation,
  ValidationQuery,
} from '../types';
import {toList} from '../../utils';
const ALLDATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];
const VegaLiteDataTypes = ['nominal', 'ordinal', 'quantitative', 'temporal'];
export const toQuote = (x: string): string => `"${x}"`;
const justCountAgg = toList(['none', 'count']);
justCountAgg[0].value = undefined;
const spatialAggs = [...justCountAgg, ...toList(['min', 'max', 'sum', 'mean', 'median', 'mode'])];

export const used = (x: string): ValidationQuery => `parameters.${x}`;
export const unused = (x: string): ValidationQuery => `!parameters.${x}`;
export const notCount = (key: string): ValidationQuery => `parameters.${key} !== "\\"COUNT\\""`;

/**
 * build a simple validation
 * @param key - the name of the dimension that will be check if it's around
 */
export const simpleValidation = (key: string): Validation => ({queryResult: 'hide', query: unused(key)});

export const makeDataTarget = (dim: string): TemplateWidget<DataTargetWidget> => ({
  name: dim,
  type: 'DataTarget',
  config: {allowedTypes: ALLDATA_TYPES, required: false},
  validations: [],
});

interface MakeMultiTargetType {
  dim: string;
  validations: Validation[];
}
export const makeMultiTarget = ({
  dim,
  validations,
}: MakeMultiTargetType): TemplateWidget<MultiDataTargetWidget> =>
  ({
    name: dim,
    type: 'MultiDataTarget',
    config: {allowedTypes: ALLDATA_TYPES, required: true, minNumberOfTargets: 0},
    validations,
  } as TemplateWidget<MultiDataTargetWidget>);

export const makeText = (textLabel: string, validations: Validation[]): TemplateWidget<TextWidget> => ({
  name: textLabel,
  type: 'Text',
  config: {text: textLabel},
  validations,
});
export const makeSection = (
  sectionLabel: string,
  validations: Validation[],
): TemplateWidget<SectionWidget> => ({
  name: sectionLabel,
  type: 'Section',
  config: null,
  validations,
});

type displayType = {display: any; value: any};
interface SimpleListType {
  name: string;
  list: string[] | displayType[];
  defaultVal?: string;
  displayName?: string;
  validations?: Validation[];
}
export const simpleList = ({
  name,
  list,
  defaultVal,
  displayName,
  validations,
}: SimpleListType): TemplateWidget<ListWidget> => {
  const firstDisplayValue = (list[0] as displayType).display;
  return {
    name,
    type: 'List',
    displayName: displayName || null,
    config: {
      allowedValues: firstDisplayValue ? (list as displayType[]) : toList(list as string[]),
      defaultValue: defaultVal ? defaultVal : firstDisplayValue ? firstDisplayValue : (list as string[])[0],
    },
    validations: validations || [],
  };
};

export const makeAgg = (key: string): TemplateWidget<ListWidget> =>
  simpleList({
    name: `${key}Agg`,
    list: spatialAggs,
    displayName: `Aggregate`,
    defaultVal: toQuote('none'),
    validations: [{queryResult: 'show', query: `${used(key)} && ${notCount(key)}`}],
  });

export const makeTypeSelect = (key: string, defaultVal: string): TemplateWidget<ListWidget> =>
  simpleList({
    name: `${key}Type`,
    list: VegaLiteDataTypes,
    displayName: 'Data type',
    defaultVal: toQuote(defaultVal),
    validations: [simpleValidation(key), {queryResult: 'show', query: `${used(key)} && ${notCount(key)}`}],
  });

interface SimpleSwitchType {
  name: string;
  displayName?: string;
  validations?: Validation[];
}
export const simpleSwitch = ({
  name,
  displayName,
  validations,
}: SimpleSwitchType): TemplateWidget<SwitchWidget> => ({
  name,
  type: 'Switch',
  displayName: displayName || null,
  config: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
  validations: validations || [],
});
