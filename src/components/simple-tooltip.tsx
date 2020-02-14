import React from 'react';
import Tooltip from 'rc-tooltip';
import {TiInfoLarge} from 'react-icons/ti';

interface SimpleTooltipProps {
  message: string;
}
export default function SimpleTooltip(props: SimpleTooltipProps): JSX.Element {
  const {message} = props;
  return (
    <Tooltip placement="top" trigger="click" overlay={<span className="tooltip-internal">{message}</span>}>
      <div className="tooltip-icon">
        <TiInfoLarge />
      </div>
    </Tooltip>
  );
}
