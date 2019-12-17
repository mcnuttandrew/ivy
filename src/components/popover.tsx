import React, {useState} from 'react';
import {classnames} from '../utils';
interface Props {
  clickTarget: React.ReactNode;
  body: any;
  className?: string;
}

export default function Popover(props: Props) {
  const {clickTarget, body, className} = props;
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
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
        {open && <div className="modal-tooltip flex-down">{children}</div>}
      </div>
    </div>
  );
}
