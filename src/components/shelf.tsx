import React from 'react';
import {ColumnHeader} from '../types';

interface ShelfProps {
  field: string;
  columns: ColumnHeader[];
  currentField?: string;
}
export default class Shelf extends React.Component<ShelfProps> {
  render() {
    const {field, currentField} = this.props;
    return (
      <div className="shelf flex">
        <div>{field}</div>
        <div>{'drop a field here'}</div>
      </div>
    );
  }
}
