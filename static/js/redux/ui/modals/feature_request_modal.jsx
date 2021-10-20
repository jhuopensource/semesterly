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
    constructor(props) {
        super(props);
        this.state = {
            fields: {},
            name: ''
        };
    }

    componentDidUpdate() {
        if (this.props.isVisible) {
            this.modal.show();
        }
    }

    componentDidMount() {
        fetch('feature/')
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.setState({
                    name: json.name,
                });
            }, false);
    }

    changeHandler(e){
        this.setState({
            value: e.target.value
        });
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
        const fields = this.state.fields;
        const name = this.state.name;
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
                    <form action="">
                        <input type="text" value={name} onChange={this.changeHandler} name='name'/>
                        <button>Submit</button>
                    </form>
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

