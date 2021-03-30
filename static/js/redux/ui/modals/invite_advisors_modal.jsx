/*
Copyright (C) 2017 Semester.ly Technologies, LLC
Semester.ly is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
Semester.ly is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/

import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'boron/FadeModal';
import * as SemesterlyPropTypes from '../../constants/semesterlyPropTypes';

class InviteAdvisorsModal extends React.Component {
  componentDidUpdate() {
    if (this.props.isVisible) {
      this.modal.show();
    }
  }

  render() {
    const modalHeader =
        (<div className="modal-content">
          <div className="modal-header">
            <h1>Invite Advisors Modal</h1>
          </div>
        </div>);
    const modalStyle = {
      width: '100%',
    };
    return (
        <Modal
          ref={(c) => { this.modal = c; }}
          className="pref-modal max-modal"
          modalStyle={modalStyle}
          onHide={this.props.toggleInviteAdvisorsModal}
        >
          <div id="perf-modal-wrapper">
            {modalHeader}
            <div className="preference cf">
              <h5>Yair Amir</h5>
              <h5>Linda Moulton</h5>
              <h5>Steven Marra</h5>]
              {/* TODO: will need to indicate whether invited already or not */}
              {/* <h5>{this.props.userInfo.userFirstName}</h5>
              <h5>{this.props.userInfo.userLastName}</h5>
              <h5>{this.props.userInfo.class_year}</h5>] */}
            </div>
          </div>
        </Modal>
    );
  }
}

InviteAdvisorsModal.propTypes = {
//   userInfo: SemesterlyPropTypes.userInfo.isRequired,
  toggleMockModal: PropTypes.func.isRequired,
//   tempInfo: SemesterlyPropTypes.tempInfo.isRequired,
  isVisible: PropTypes.func.isRequired,
};

export default InviteAdvisorsModal;
