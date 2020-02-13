import {TemplateWidget, ListWidget, SwitchWidget, SliderWidget, WidgetSubType} from '../templates/types';
import {Suggestion} from './introspect';
const DUMMY = 'xxxxxEXAMPLExxxx';
export function generateFullTemplateMap(widgets: TemplateWidget<WidgetSubType>[]): {[x: string]: any} {
  return widgets.reduce((acc: {[x: string]: any}, widget: TemplateWidget<WidgetSubType>) => {
    const widgetType = widget.type;
    if (widgetType === 'DataTarget') {
      acc[widget.name] = `"${DUMMY}"`;
    }
    if (widgetType === 'MultiDataTarget') {
      acc[widget.name] = `[${DUMMY}, ${DUMMY}]`;
    }
    if (widgetType === 'List') {
      const localW = widget as TemplateWidget<ListWidget>;
      acc[widget.name] = localW.config.defaultValue;
    }
    if (widgetType === 'Switch') {
      const localW = widget as TemplateWidget<SwitchWidget>;
      acc[widget.name] = localW.config.activeValue;
    }
    if (widgetType === 'Slider') {
      const localW = widget as TemplateWidget<SliderWidget>;
      acc[widget.name] = localW.config.defaultValue;
    }
    return acc;
  }, {});
}

export function union(setA: Set<any>, setB: Set<any>): Set<any> {
  const _union = new Set(setA);
  for (const elem of setB) {
    _union.add(elem);
  }
  return _union;
}
export function difference(setA: Set<any>, setB: Set<any>): Set<any> {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

export const buildSuggest = (from: string, to: string): Suggestion => ({
  from: `"${from}"`,
  to: `"[${to}]"`,
  comment: `${from} -> ${to}`,
  simpleReplace: false,
});

// https://www.rosettacode.org/wiki/Balanced_brackets#Iterative
// a very very dumb hack
function isBalanced(str: string): boolean {
  return (str.match(/\[/g) || []).length === (str.match(/\]/g) || []).length;
}
export function safeParse(code: string): string | boolean {
  let x = null;
  if (!isBalanced(code)) {
    return false;
  }
  try {
    x = JSON.parse(code);
  } catch (e) {
    x = false;
  }
  return x;
}
