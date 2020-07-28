import React from 'react';
import {connect} from 'react-redux';

import GALLERY from '../templates/gallery';
import * as actionCreators from '../actions/index';

import {DataRow, ActionUser} from '../actions/index';
import {computeValidAddNexts} from '../utils';

import {AppState, ColumnHeader, Template, TemplateMap} from '../types';

import DataColumn from '../components/data-column';
import ImportDataColumn from '../components/import-data-column';

interface DataColumnProps extends ActionUser {
  columns: ColumnHeader[];
  currentlySelectedFile: string;
  data: DataRow[];
  fillableFields: Set<string>;
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  template: Template;
  templateComplete: boolean;
  templateMap: TemplateMap;
}

function LeftColumn(props: DataColumnProps): JSX.Element {
  const {columns, createFilter} = props;
  return (
    <div className="flex-down full-height column background-2">
      <ImportDataColumn
        currentlySelectedFile={props.currentlySelectedFile}
        setModalState={props.setModalState}
      />
      <DataColumn
        addToNextOpenSlot={props.addToNextOpenSlot}
        coerceType={props.coerceType}
        columns={columns}
        createFilter={createFilter}
        deleteFilter={props.deleteFilter}
        fillableFields={props.fillableFields}
        onDropFilter={(item: any): any => createFilter(columns.find(d => d.field === item.text))}
        showGUIView={props.showGUIView}
        template={props.template}
        templateMap={props.templateMap}
        updateFilter={props.updateFilter}
      />
    </div>
  );
}

export function mapStateToProps({base}: {base: AppState}): any {
  const template = base.currentTemplateInstance;
  const templateMap = base.templateMap;
  const isGallery = template && GALLERY.templateName === template.templateName;
  return {
    columns: base.columns,
    currentlySelectedFile: base.currentlySelectedFile,
    fillableFields: computeValidAddNexts(template, templateMap),
    showProgrammaticMode: isGallery ? false : base.showProgrammaticMode,
    showGUIView: base.showGUIView,
    template,
    templateMap,
    viewCatalog: base.viewCatalog,
  };
}

export default connect(mapStateToProps, actionCreators)(LeftColumn);
