import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'boron/WaveModal';
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
        const userInfo =
            (<div className="modal-content">
                <div>
                    <p>First name: { this.props.userInfo.userFirstName }</p>
                    <p>Last Name: { this.props.userInfo.userLastName } </p>
                    <p>Graduating class: { this.props.userInfo.class_year }</p>
                </div>
            </div>);

        const homeInfo =
            (<div className="modal-content">
                <div>
                    <p>Bed: { this.props.homeInfo.bed }</p>
                    <p>Desk: { this.props.homeInfo.desk } </p>
                    <p>Chair: { this.props.homeInfo.chair }</p>
                </div>
            </div>);

        return (
            <Modal
                ref={(c) => { this.modal = c; }}
                className="mock-modal max-modal"
                modalStyle={modalStyle}
                onHide={this.props.toggleMockModal}
            >
                { modalHeader }
                { userInfo }
                { homeInfo }

            </Modal>
        );
    }
}

MockModal.propTypes = {
    toggleMockModal: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
    userInfo: SemesterlyPropTypes.userInfo.isRequired,
    homeInfo: SemesterlyPropTypes.homeInfo.isRequired,
};

export default MockModal;