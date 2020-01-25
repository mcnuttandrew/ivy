import React, {useState} from 'react';
import {GenericAction} from '../../actions/index';
import {Template} from '../../templates/types';
import Modal from '../modal';
import LocalPrograms from './local-programs';
import CommunityPrograms from './community-programs';
import {classnames} from '../../utils';

interface Props {
  chainActions: GenericAction<any>;
  deleteTemplate: GenericAction<string>;
  loadExternalTemplate: GenericAction<Template>;
  setEncodingMode: GenericAction<string>;
  templates: Template[];
  toggleProgramModal: GenericAction<void>;
}

export default function ProgramModal(props: Props): JSX.Element {
  const {toggleProgramModal, loadExternalTemplate} = props;
  const [tab, setTab] = useState('Local');
  return (
    <Modal
      modalToggle={toggleProgramModal}
      className="program-modal"
      modalTitle="Choose, Remove, or Find New Programs"
      bodyDirectionDown={true}
    >
      <div className="flex-down full-height-with-hide ">
        <div className="flex">
          {['Local', 'Community'].map(mode => {
            return (
              <button
                className={classnames({selected: tab === mode})}
                key={mode}
                onClick={(): any => setTab(mode)}
              >
                {mode}
              </button>
            );
          })}
        </div>
        <div className="full-height-with-hide ">
          {tab === 'Local' && <LocalPrograms {...props} />}
          {tab === 'Community' && <CommunityPrograms loadExternalTemplate={loadExternalTemplate} />}
        </div>
      </div>
    </Modal>
  );
}
