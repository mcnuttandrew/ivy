import React from 'react';
import {HoverTooltip} from '../tooltips';
import {TiArrowSync} from 'react-icons/ti';
import {GenericAction} from '../../actions';
interface Props {
  fillTemplateMapWithDefaults: GenericAction<void>;
}

export default function NewTemplateTooltip(props: Props): JSX.Element {
  const {fillTemplateMapWithDefaults} = props;

  return (
    <div className="template-modification-control">
      <HoverTooltip message={"Reset the template to it's blank state."}>
        <div className="flex" onClick={(): any => fillTemplateMapWithDefaults()}>
          <div className="template-modification-control-icon">
            <TiArrowSync />
          </div>
          <span className="template-modification-control-label">Reset</span>
        </div>
      </HoverTooltip>
    </div>
  );
}
