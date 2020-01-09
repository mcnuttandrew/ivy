import Immutable, {Map} from 'immutable';

import {ActionResponse, AppState} from './default-state';
import {getTemplate} from '../utils';
import {EMPTY_SPEC, toggle, blindSet} from './default-state';
import {ColumnHeader} from '../types';

import {addToNextOpenSlot} from './apt-actions';
import {fillTemplateMapWithDefaults, templateEval} from './template-actions';
import {getAllInUseFields} from '../utils';

export const setProgrammaticView = toggle('showProgrammaticMode');
export const toggleDataModal = toggle('dataModalOpen');

export const changeTheme = blindSet('currentTheme');
export const setEditMode = blindSet('editMode');
export const setCodeMode = blindSet('codeMode');

const quoteTrim = (x: string): string => x.slice(1, x.length - 1);

function activeColumns(state: any): string[] {
  const template = state.get('currentTemplateInstance');
  if (!template) {
    return Array.from(getAllInUseFields(state.get('spec')));
  }
  const templateMap = state.get('templateMap');
  const templateInUse = template
    .get('widgets')
    .reduce((acc: Set<string>, widget: any) => {
      const widgetType = widget.get('widgetType');
      const val = templateMap.get(widget.get('widgetName'));
      // we only care about the data containing columns
      if (widgetType === 'MultiDataTarget') {
        return val.reduce((mem: Set<string>, key: string) => mem.add(key), acc);
      }
      if (widgetType === 'DataTarget' && val) {
        return acc.add(val);
      }

      return acc;
    }, new Set());
  return Array.from(templateInUse).map((key: string) => quoteTrim(key));
}

// given a list of columns you want to use, try to fill them into the current template map
// TODO: i think this function can really general later for constructing example charts
// Also just lots of auto fill functionality
const fillTemplateMapWithColumns = (state: any, columns: ColumnHeader[]) => {
  const template = state.get('currentTemplateInstance');
  const typePiles = columns.reduce((acc: any, column: ColumnHeader) => {
    acc[column.type] = (acc[column.type] || []).concat(column);
    return acc;
  }, {});
  const selectPile = (allowedTypes: any) =>
    allowedTypes
      .toJS()
      .find((type: string) => typePiles[type] && typePiles[type].length);
  // we're using these piles as stacks, so need to reverse em
  Object.keys(typePiles).forEach(key => typePiles[key].reverse());

  const updatedMap = template
    .get('widgets')
    .reduce((acc: Map<string, string>, widget: any) => {
      const widgetName = widget.get('widgetName');
      const widgetType = widget.get('widgetType');
      const allowedTypes = widget.getIn(['widget', 'allowedTypes']);
      // we only care about the data containing columns
      if (widgetType === 'MultiDataTarget') {
        const maxCols = Math.max(
          widget.getIn(['widget', 'maxNumberOfTargets']),
          5,
        );
        const selectedColumns = [...new Array(maxCols)].reduce(
          (mem: string[], _) => {
            const targetType = selectPile(allowedTypes);
            return targetType
              ? mem.concat(typePiles[targetType].pop().field)
              : mem;
          },
          [],
        );
        // unsure if this should be ummutable
        return acc.set(widgetName, selectedColumns);
      }
      if (widgetType === 'DataTarget') {
        const targetType = selectPile(allowedTypes);
        return targetType
          ? acc.set(widgetName, `"${typePiles[targetType].pop().field}"`)
          : acc;
      }

      return acc;
    }, state.get('templateMap'));
  return templateEval(state.set('templateMap', updatedMap));
};

export const setEncodingMode: ActionResponse = (state, payload) => {
  const newState = state.set('encodingMode', payload);
  const columnMap = state
    .get('columns')
    .reduce((acc: any, x: ColumnHeader) => acc.set(x.field, x), Map());
  // 1. figure out what the currently active columns are
  // 2. get their types
  const carriedColumns = activeColumns(state).map(key => columnMap.get(key));

  // 3. apply as relevant to new encoding
  if (payload !== 'grammer') {
    // INSTANTIATE TEMPLATE AS A LOCAL COPY

    // this will become the local copy of the template
    const template = getTemplate(state, payload);
    const updatedSpec = Immutable.fromJS(JSON.parse(template.code));
    const updatedState = newState
      .set('currentTemplateInstance', Immutable.fromJS(template))
      .set('spec', updatedSpec);
    return fillTemplateMapWithColumns(
      fillTemplateMapWithDefaults(updatedState),
      carriedColumns,
    );
  } else {
    const updatedState = newState
      .set('spec', EMPTY_SPEC)
      .set('currentTemplateInstance', null);
    return carriedColumns.reduce(
      (acc: AppState, column: ColumnHeader) => addToNextOpenSlot(acc, column),
      updatedState,
    );
  }
};
