import {
  DataTargetWidget,
  ListWidget,
  SwitchWidget,
  TextWidget,
  TemplateWidget,
  DataType,
  SectionWidget,
  WidgetValidationQuery,
  WidgetValidation,
} from '../types';
import {toList} from '../../utils';
const ALLDATA_TYPES: DataType[] = ['MEASURE', 'DIMENSION', 'METACOLUMN', 'TIME'];
const VegaLiteDataTypes = ['nominal', 'ordinal', 'quantitative', 'temporal']; //.map(toQuote);
export const toQuote = (x: string): string => `"${x}"`;
const justCountAgg = toList(['none', 'count']);
justCountAgg[0].value = undefined;
const spatialAggs = [...justCountAgg, ...toList(['min', 'max', 'sum', 'mean', 'median', 'mode'])];
export const makeDataTarget = (dim: string): TemplateWidget<DataTargetWidget> => ({
  widgetName: dim,
  widgetType: 'DataTarget',
  widget: {allowedTypes: ALLDATA_TYPES, required: false},
});

export const makeText = (textLabel: string): TemplateWidget<TextWidget> => ({
  widgetName: textLabel,
  widgetType: 'Text',
  widget: {text: textLabel},
});
export const makeSection = (sectionLabel: string): TemplateWidget<SectionWidget> => ({
  widgetName: sectionLabel,
  widgetType: 'Section',
  widget: null,
});

type displayType = {display: any; value: any};
interface SimpleListType {
  widgetName: string;
  list: string[] | displayType[];
  defaultVal?: string;
  displayName?: string;
}
export const simpleList = ({
  widgetName,
  list,
  defaultVal,
  displayName,
}: SimpleListType): TemplateWidget<ListWidget> => {
  const firstDisplayValue = (list[0] as displayType).display;
  return {
    widgetName,
    widgetType: 'List',
    displayName: displayName || null,
    widget: {
      allowedValues: firstDisplayValue ? (list as displayType[]) : toList(list as string[]),
      defaultValue: defaultVal ? defaultVal : firstDisplayValue ? firstDisplayValue : (list as string[])[0],
    },
  };
};

// varitals of simpleList
export const makeSimpleAgg = (key: string): TemplateWidget<ListWidget> =>
  simpleList({
    widgetName: `${key}AggSimple`,
    list: justCountAgg,
    displayName: `Aggregate`,
    defaultVal: toQuote('none'),
  });
export const makeFullAgg = (key: string): TemplateWidget<ListWidget> =>
  simpleList({
    widgetName: `${key}AggFull`,
    list: spatialAggs,
    displayName: `Aggregate`,
    defaultVal: toQuote('none'),
  });

export const makeTypeSelect = (key: string, defaultVal: string): TemplateWidget<ListWidget> =>
  simpleList({
    widgetName: `${key}Type`,
    list: VegaLiteDataTypes,
    displayName: 'Data type',
    defaultVal: toQuote(defaultVal),
  });

interface SimpleSwitchType {
  widgetName: string;
  displayName?: string;
}
export const simpleSwitch = ({widgetName, displayName}: SimpleSwitchType): TemplateWidget<SwitchWidget> => ({
  widgetName,
  widgetType: 'Switch',
  displayName: displayName || null,
  widget: {activeValue: 'true', inactiveValue: 'false', defaultsToActive: true},
});

export const used = (x: string): WidgetValidationQuery => `parameters.${x}`;
export const unused = (x: string): WidgetValidationQuery => `!parameters.${x}`;
export function addValidation(acc: WidgetValidation[], key: string) {
  return function adder(queryTarget: string): void {
    acc.push({queryTarget, queryResult: 'hide', query: unused(key)});
  };
}
