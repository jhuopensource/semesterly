import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'boron/FadeModal';

class MockModal extends React.Component {
  componentDidUpdate() {
    if (this.props.isVisible) {
      this.modal.show();
    }
  }

  render() {
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
              <p style={{ margin: 0 }}>Conflicts: </p>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

MockModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
};

export default MockModal;