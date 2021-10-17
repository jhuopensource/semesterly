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

class FeatureRequestModal extends React.Component {

    componentDidUpdate() {
        if (this.props.isVisible) {
            this.modal.show();
        }
    }

    render() {
        const modalHeader =
            (<div className="modal-content">
                <div className="modal-header">
                    <h1>Request a Feature</h1>
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
                onHide={this.props.toggleFeatureRequestModal}
            >
                <div id="perf-modal-wrapper">
                    {modalHeader}
                    <hr style={{ marginTop: 0, width: '80%' }} />

                </div>
            </Modal>
        );
    }
}



FeatureRequestModal.propTypes = {
    toggleFeatureRequestModal: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
};

export default FeatureRequestModal;

