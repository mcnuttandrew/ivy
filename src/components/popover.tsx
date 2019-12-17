import React, {useState} from 'react';

interface Props {
  clickTarget: React.ReactNode;
  body: any;
}

export default function Popover(props: Props) {
  const {clickTarget, body} = props;
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  const children = body(toggle);
  return (
    <div className="flex tooltip-container">
      <div onClick={toggle}>{clickTarget}</div>
      {open && <div className="modal-background" onClick={toggle} />}
      <div className="modal-tooltip-container">
        {open && <div className="modal-tooltip flex-down">{children}</div>}
      </div>
    </div>
  );
}
