import {
  DataTargetWidget,
  DataType,
  ListWidget,
  MultiDataTargetWidget,
  SectionWidget,
  SwitchWidget,
  Widget,
  TextWidget,
  Condition,
  ConditionQuery,
} from '../types';
export const toList = (list: string[]): {display: string; value: string}[] =>
  list.map(display => ({
    display,
    value: `"${display}"`,
  }));
const ALLDATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'TIME'];
const VegaLiteDataTypes = ['nominal', 'ordinal', 'quantitative', 'temporal'];
export const toQuote = (x: string): string => `"${x}"`;
const justCountAgg = toList(['none', 'count']);
justCountAgg[0].value = undefined;
const spatialAggs = [...justCountAgg, ...toList(['min', 'max', 'sum', 'mean', 'median', 'mode', 'distinct'])];

export const used = (x: string): ConditionQuery => `Boolean(${x})`;
export const unused = (x: string): ConditionQuery => `!${x}`;
export const notCount = (key: string): ConditionQuery => `!${key}.includes('COUNT')`;

/**
 * build a simple condition
 * @param key - the name of the dimension that will be check if it's around
 */
export const simpleCondition = (key: string): Condition => ({queryResult: 'hide', query: unused(key)});

export const makeDataTarget = (dim: string): Widget<DataTargetWidget> => ({
  name: dim,
  type: 'DataTarget',
  config: {allowedTypes: ALLDATA_TYPES, required: false},
  conditions: [],
});

interface MakeMultiTargetType {
  dim: string;
  conditions: Condition[];
}
export const makeMultiTarget = ({dim, conditions}: MakeMultiTargetType): Widget<MultiDataTargetWidget> =>
  ({
    name: dim,
    type: 'MultiDataTarget',
    config: {allowedTypes: ALLDATA_TYPES, required: true, minNumberOfTargets: 0},
    conditions,
  } as Widget<MultiDataTargetWidget>);

export const makeText = (textLabel: string, conditions: Condition[]): Widget<TextWidget> => ({
  name: textLabel,
  type: 'Text',
  config: {text: textLabel},
  conditions,
});
export const makeSection = (sectionLabel: string, conditions: Condition[]): Widget<SectionWidget> => ({
  name: sectionLabel,
  type: 'Section',
  config: null,
  conditions,
});

type displayType = {display: any; value: any};
interface SimpleListType {
  name: string;
  list: string[] | displayType[];
  defaultVal?: string;
  displayName?: string;
  conditions?: Condition[];
}
export const simpleList = ({
  name,
  list,
  defaultVal,
  displayName,
  conditions,
}: SimpleListType): Widget<ListWidget> => {
  const firstDisplayValue = (list[0] as displayType).display;
  return {
    name,
    type: 'List',
    displayName: displayName || null,
    config: {
      allowedValues: firstDisplayValue ? (list as displayType[]) : toList(list as string[]),
      defaultValue: defaultVal ? defaultVal : firstDisplayValue ? firstDisplayValue : (list as string[])[0],
    },
    conditions: conditions || [],
  };
};

export const makeAgg = (key: string): Widget<ListWidget> =>
  simpleList({
    name: `${key}Agg`,
    list: spatialAggs,
    displayName: `Aggregate`,
    defaultVal: toQuote('none'),
    conditions: [
      {
        queryResult: 'show',
        query: `${used(key)} && ${notCount(key)} && ${key}Type.includes('quantitative')`,
      },
    ],
  });

export const makeTypeSelect = (key: string, defaultVal: string): Widget<ListWidget> =>
  simpleList({
    name: `${key}Type`,
    list: VegaLiteDataTypes,
    displayName: 'Data type',
    defaultVal: toQuote(defaultVal),
    conditions: [simpleCondition(key), {queryResult: 'show', query: `${used(key)} && ${notCount(key)}`}],
  });

interface SimpleSwitchType {
  name: string;
  displayName?: string;
  conditions?: Condition[];
  defaultsToActive?: boolean;
  disallowFanOut?: boolean;
}
export const simpleSwitch = ({
  name,
  displayName,
  conditions,
  defaultsToActive = true,
}: SimpleSwitchType): Widget<SwitchWidget> => ({
  name,
  type: 'Switch',
  displayName: displayName || null,
  config: {active: 'true', inactive: 'false', defaultsToActive},
  conditions: conditions || [],
});
