import React, {useState} from 'react';
import {classnames} from '../utils';
interface Props {
  clickTarget: React.ReactNode;
  body: (toggle: () => void) => JSX.Element;
  className?: string;
  style?: any;
}
const defaultStyle = {
  height: '300px',
  width: '300px',
  left: '14px',
  top: '-6px',
};
export default function Popover(props: Props): JSX.Element {
  const {clickTarget, body, className, style} = props;
  const combinedStyles = {...defaultStyle, ...style};
  const [open, setOpen] = useState(false);
  const toggle = (): void => setOpen(!open);
  const children = body(toggle);
  return (
    <div className="flex tooltip-container">
      <div onClick={toggle} className="tooltip-click-target">
        {clickTarget}
      </div>
      {open && <div className="modal-background" onClick={toggle} />}
      <div
        className={classnames({
          'modal-tooltip-container': true,
          [className]: true,
        })}
      >
        {open && (
          <div className="modal-tooltip flex-down" style={combinedStyles}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
