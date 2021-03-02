import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'boron/WaveModal';
import SortMenuContainer from '../containers/sort_menu_container';

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
        return (
            <Modal
                ref={(c) => { this.modal = c; }}
                className="mock-modal max-modal"
                modalStyle={modalStyle}
                onHide={this.props.toggleMockModal}
            >
                {modalHeader}
            </Modal>
        );
    }
}

MockModal.propTypes = {
    toggleMockModal: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
};

export default MockModal;