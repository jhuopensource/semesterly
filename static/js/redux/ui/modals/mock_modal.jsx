import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'boron/FadeModal';
import * as SemesterlyPropTypes from '../../constants/semesterlyPropTypes';


class MockModal extends React.Component {
  componentDidUpdate() {
    if (this.props.isVisible) {
      this.modal.show();
    }
  }

  render() {

    console.log(this.props);

    const modalHeader =
      (<div className="modal-content">
        <div className="modal-header">
          <h1>Mock Modal!</h1>
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
        ref={(c) => { this.modal = c; }}
        className="pref-modal max-modal"
        modalStyle={modalStyle}
        onHide={() => {
          this.props.toggleMockModal();
          history.replaceState({}, 'Semester.ly', '/');
        }}
      >
        <div id="perf-modal-wrapper">
          {modalHeader}
          <div className="conflict-row">
            <div style={{ marginRight: 'auto', marginLeft: '15%' }}>
              <p style={{ margin: 0 }}>First Name: {this.props.userInfo.userFirstName}</p>
              <p style={{ margin: 0 }}>Last Name: {this.props.userInfo.userLastName}</p>
              <p style={{ margin: 0 }}>Graduating Class: {this.props.userInfo.class_year}</p>
              <p style={{ margin: 0 }}>Favorite Food: {this.props.userInfo.mock_data.favorite_food}</p>
              <p style={{ margin: 0 }}>Favorite Movie: {this.props.userInfo.mock_data.favorite_movie}</p>
              <p style={{ margin: 0 }}>Least Favorite Number: {this.props.userInfo.mock_data.least_favorite_num}</p>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

MockModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  userInfo: SemesterlyPropTypes.userInfo.isRequired
};

export default MockModal;