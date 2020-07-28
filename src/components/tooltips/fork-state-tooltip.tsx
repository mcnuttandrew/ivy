import React from 'react';
import Tooltip from 'rc-tooltip';
import {HoverTooltip} from '../tooltips';
import {Link} from 'react-router-dom';
import {TiFlowChildren} from 'react-icons/ti';
import {Template} from '../../types';
import {GenericAction} from '../../actions/index';

interface Props {
  setBlankTemplate: GenericAction<{fork: string | null; language: string}>;
  setEditMode: GenericAction<boolean>;
  template: Template;
}

export default function ForkStateTooltip(props: Props): JSX.Element {
  const {setBlankTemplate, setEditMode, template} = props;
  const buildReaction = (forkType: string) => (): any => {
    setBlankTemplate({fork: forkType, language: template.templateLanguage});
    setEditMode(true);
  };
  return (
    <HoverTooltip
      message={
        'Create a new template starting from the current value of "Export To JSON" as the basis of the template.'
      }
      delay={5}
    >
      <div className="template-modification-control">
        <Tooltip
          placement="bottom"
          trigger="click"
          overlay={
            <div className="tooltip-internal flex-down">
              <h5>How should we copy the current state?</h5>
              <button type="button" onClick={buildReaction('output')}>
                <Link to="/editor/new">Just output</Link>
              </button>
              <button type="button" onClick={buildReaction('body')}>
                <Link to="/editor/new">Body but not params</Link>
              </button>
              <button type="button" onClick={buildReaction('all')}>
                <Link to="/editor/new">Everything</Link>
              </button>
            </div>
          }
        >
          <span className="flex">
            <TiFlowChildren />
            Fork
          </span>
        </Tooltip>
      </div>
    </HoverTooltip>
  );
}
