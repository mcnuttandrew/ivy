import React from 'react';
import Tooltip from 'rc-tooltip';
import {TiInfoLarge} from 'react-icons/ti';

interface SimpleTooltipProps {
  message: string;
}
export function SimpleTooltip(props: SimpleTooltipProps): JSX.Element {
  const {message} = props;
  return (
    <Tooltip placement="top" trigger="click" overlay={<span className="tooltip-internal">{message}</span>}>
      <div className="tooltip-icon">
        <TiInfoLarge />
      </div>
    </Tooltip>
  );
}

interface HoverTooltipProps {
  children: JSX.Element;
  message: string;
  delay?: number;
}
export function HoverTooltip(props: HoverTooltipProps): JSX.Element {
  const {children, message, delay} = props;
  return (
    <Tooltip
      placement="top"
      trigger="hover"
      mouseEnterDelay={delay || 1.2}
      overlay={<span className="tooltip-internal">{message}</span>}
    >
      {children}
    </Tooltip>
  );
}
