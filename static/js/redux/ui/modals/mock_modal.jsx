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
import Modal from 'boron/ScaleModal';
import * as SemesterlyPropTypes from '../../constants/semesterlyPropTypes';

class MockModal extends React.Component {
  componentDidMount() {
    if (this.props.isVisible) {
      this.modal.show();
    }
  }

  componentDidUpdate() {
    if (this.props.isVisible) {
      this.modal.show();
    }
  }

  render() {
    const modalHeader =
      (<div className="modal-content">
        <div className="modal-header">
          <h1>Mock Modal</h1>
          <div className="modal-close" onClick={() => this.modal.hide()}>
            <i className="fa fa-times" />
          </div>
        </div>
      </div>);
    const modalStyle = {
      width: '100%',
    };

    const studentInfo =
      (<div>
        <p>First Name: {this.props.userInfo.userFirstName}</p>
        <p>Last Name: {this.props.userInfo.userLastName}</p>
        <p>Class Year: {this.props.userInfo.class_year}</p>
      </div>)

    return (<Modal
      ref={(c) => { this.modal = c; }}
      className="abnb-modal"
      modalStyle={modalStyle}
      onHide={() => {
        this.props.toggleMockModal();
      }}
    >
      {modalHeader}
      {studentInfo}
    </Modal >
    );
  }
}

MockModal.propTypes = {
  toggleMockModal: PropTypes.func.isRequired,
  userInfo: SemesterlyPropTypes.userInfo.isRequired,
  isVisible: PropTypes.bool.isRequired,
}

export default MockModal