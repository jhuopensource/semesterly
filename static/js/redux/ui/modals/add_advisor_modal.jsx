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
import Modal from 'boron/WaveModal';
import Cookie from 'js-cookie';
import { getAdvisorTestAdd } from '../../constants/endpoints';

class AddAdvisorModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      jhed: '',
      firstName: '',
      lastName: '',
      submitted: false,
    };
  }

  componentDidMount() {
    if (this.props.isVisible) {
      this.modal.show();
    }
  }

  componentDidUpdate() {
    if (this.props.isVisible) {
      this.modal.show();
    }
    if (this.state.submitted === true) {
      window.location.reload();
      this.state.submitted = !this.state.submitted;
    }
  }

  sendJHED(event) {
    this.setState({ jhed: event.target.value });
  }

  sendFirstName(event) {
    this.setState({ firstName: event.target.value });
  }

  sendLastName(event) {
    this.setState({ lastName: event.target.value });
  }

  submitContent() {
    if (this.state.comment !== '') {
      fetch(getAdvisorTestAdd(), {
        method: 'POST',
        headers: {
          'X-CSRFToken': Cookie.get('csrftoken'),
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          JhedId: this.state.jhed,
          FullName: `${this.state.lastName},${this.state.firstName}`,
        }),
      })
        .then(this.setState({ jhed: this.state.jhed = '',
          firstName: this.state.firstName = '',
          lastName: this.state.lastName = '',
          submitted: !this.state.submitted }));
    }
  }

  render() {
    const { jhed, firstName, lastName } = this.state;

    const modalHeader =
      (<div className="modal-content">
        <div className="modal-header">
          <h1>Add New Advisors</h1>
          <div className="modal-close" onClick={() => this.modal.hide()}>
            <i className="fa fa-times" />
          </div>
        </div>
      </div>);
    const modalStyle = {
      width: '100%',
    };
    return (
      <Modal
        ref={(c) => {
          this.modal = c;
        }}
        className="SIS-import-data-modal abnb-modal max-modal"
        modalStyle={modalStyle}
        onHide={() => {
          this.props.toggleAddAdvisorModal();
        }}
      >
        {modalHeader}
        <form action="#1">
          <textarea
            style={{ display: 'block',
              width: '90%',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: '20px',
              marginBottom: '10px' }}
            className="cf-input"
            rows="1" placeholder="Enter Advisor JHED"
            value={jhed}
            onChange={event => this.sendJHED(event)}
          />
          <textarea
            style={{ display: 'block', width: '90%', marginLeft: 'auto', marginRight: 'auto', marginBottom: '10px' }}
            className="cf-input"
            rows="1" placeholder="Enter Advisor First Name"
            value={firstName}
            onChange={event => this.sendFirstName(event)}
          />
          <textarea
            style={{ display: 'block', width: '90%', marginLeft: 'auto', marginRight: 'auto', marginBottom: '10px' }}
            className="cf-input"
            rows="1" placeholder="Enter Advisor Last Name"
            value={lastName}
            onChange={event => this.sendLastName(event)}
          />
          <input
            style={{ display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              color: 'white',
              backgroundColor: '#1abc9c',
              border: 0 }}
            className="send-btn"
            type="submit"
            value="Add Advisor"
            onClick={() => this.submitContent()}
          />
          <p>
            <br />
          </p>
        </form>
      </Modal>
    );
  }
}

AddAdvisorModal.propTypes = {
  toggleAddAdvisorModal: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

export default AddAdvisorModal;

