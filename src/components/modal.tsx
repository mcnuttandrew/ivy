import React from 'react';
import {classnames} from '../utils';
import {TiDelete} from 'react-icons/ti';

interface Props {
  modalToggle: any;
  className?: string;
  children?: React.ReactNode;
  modalTitle: string;
  modalDetails?: string;
  bodyDirectionDown?: boolean;
}

export default class Modal extends React.PureComponent<Props> {
  render() {
    const {
      modalToggle,
      children,
      modalTitle,
      modalDetails = '',
      className = '',
      bodyDirectionDown,
    } = this.props;

    return (
      <div className="modal-container">
        <div className="modal-background" onClick={modalToggle} />
        <div
          className={classnames({
            'flex-down': true,
            [className]: true,
          })}
        >
          <div className="modal-header">
            <div className="flex space-between">
              <h2>{modalTitle}</h2>
              <div className="modal-close-button" onClick={modalToggle}>
                <TiDelete />
              </div>
            </div>
            <p>{modalDetails}</p>
          </div>
          <div
            className={classnames({
              'modal-body': true,
              flex: !bodyDirectionDown,
              'flex-down': bodyDirectionDown,
            })}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
}
