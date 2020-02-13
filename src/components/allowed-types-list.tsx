import React from 'react';
import Tooltip from 'rc-tooltip';
import {classnames} from '../utils';

interface AllowedTypesListProps {
  allowedTypes: string[];
}
export default function AllowedTypesList(props: AllowedTypesListProps): JSX.Element {
  const {allowedTypes} = props;
  return (
    <div className="flex data-type-container">
      {allowedTypes.map(type => {
        return (
          <Tooltip
            key={type}
            placement="bottom"
            trigger="click"
            overlay={
              <span className="tooltip-internal">{`Indicates that this data target accepts columns of ${type} type`}</span>
            }
          >
            <div
              className={classnames({
                [`${type.toLowerCase()}-pill`]: true,
                'symbol-box': true,
              })}
              key={type}
            />
          </Tooltip>
        );
      })}
    </div>
  );
}
