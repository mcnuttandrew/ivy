import React from 'react';
import Immutable from 'immutable';
import {DndProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TemplateColumn from '../template-column';
import {ColumnHeader, DataType} from '../../types';
import Pill from '../pill';

import {Template} from '../../constants/templates';
import {setTemplateMapValue} from '../../reducers/template-actions';

interface Props {
  newTemplate: Template;
}

interface State {
  templateMap: {[x: string]: any};
}

const fakeColumns: ColumnHeader[] = [
  ...['DIMENSION', 'MEASURE', 'TIME', 'METACOLUMN'].map((key: DataType) => {
    return {
      type: key,
      originalType: key,
      secondaryType: 'fake',
      field: `example${key}`,
      domain: [],
      metaColumn: key === 'METACOLUMN',
    };
  }),
];

export default class TemplateColumnPreview extends React.Component<
  Props,
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {
      templateMap: {},
    };
  }

  render() {
    const {newTemplate} = this.props;
    const {templateMap} = this.state;

    return (
      <DndProvider backend={HTML5Backend}>
        <div>
          <h3> Example Data Columns </h3>
          <div className="fake-pill-container">
            {fakeColumns.map(column => {
              return <Pill column={column} inEncoding={false} />;
            })}
          </div>
        </div>
        <h3>Live Template Preview</h3>
        <TemplateColumn
          template={newTemplate}
          templateMap={templateMap}
          columns={fakeColumns}
          setTemplateValue={(value: any) => {
            console.log(value);
            this.setState({
              templateMap: setTemplateMapValue(
                Immutable.fromJS(templateMap),
                value,
              ).toJS(),
            });
          }}
        />
      </DndProvider>
    );
  }
}
