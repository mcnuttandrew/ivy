// /* eslint-disable react/prop-types */
import React, {useState} from 'react';
import {GenericAction} from '../../actions/index';
import Modal from './modal';
import {writeUserName} from '../../utils/local-storage';

interface Props {
  setModalState: GenericAction<string | null>;
  userName: string;
  setUserName: GenericAction<string>;
}

export default function UserModal(props: Props): JSX.Element {
  const {setModalState, userName, setUserName} = props;
  const [localName, setName] = useState(userName);
  return (
    <Modal
      modalToggle={(): any => setModalState(null)}
      className="user-modal"
      modalTitle="User Panel"
      bodyDirectionDown={true}
    >
      <div className="flex-down">
        <h3>Change your user name</h3>
        <input
          value={localName}
          onChange={(e): void => {
            setName(e.target.value);
          }}
        />
        <button
          onClick={(): void => {
            writeUserName(localName);
            setUserName(localName);
          }}
        >
          Change
        </button>
      </div>
    </Modal>
  );
}
