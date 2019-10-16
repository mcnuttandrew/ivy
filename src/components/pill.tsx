import React from 'react';
import {ColumnHeader, DataType} from '../types';

interface PillProps {
  column: ColumnHeader;
}
function getTypeSymbol(type: DataType): string {
  switch (type) {
    case 'MEASURE':
      return '#';
    // case 'TIME':
    //   return 'T';
    default:
    case 'DIMENSION':
      return 'A';
  }
}

export default class Pill extends React.Component<PillProps> {
  render() {
    const {column} = this.props;
    return (
      <div className="shelf flex">
        <div>^</div>
        <div>{getTypeSymbol(column.type)}</div>
        <div>{column.field}</div>
        <div>Filt</div>
        <div>+</div>
      </div>
    );
  }
}
