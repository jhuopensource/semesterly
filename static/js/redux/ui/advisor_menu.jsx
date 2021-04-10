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
import classNames from 'classnames';
import ClickOutHandler from 'react-onclickout';
import ReactTooltip from 'react-tooltip';
import * as SemesterlyPropTypes from '../constants/semesterlyPropTypes';
import AdvisorRow from "./advisor_row";

class AdvisorMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {showDropdown: false};
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.hideDropDown = this.hideDropDown.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown() {
        this.setState({showDropdown: !this.state.showDropdown});
    }

    hideDropDown() {
        this.setState({showDropdown: false});
    }

    render() {

        const toggleAdvisorMenuBtn = (
            <div style={{margin: "right"}}>
                <button
                className="save-timetable add-button"
                data-for="add-btn-tooltip"
                >
                    <i className="fa fa-plus" />
                </button>

                <ReactTooltip
                id="add-btn-tooltip"
                class="tooltip"
                type="dark"
                place="bottom"
                effect="solid"
                >
                    <span>Invite Advisors</span>
                </ReactTooltip>
            </div>
        );

        const addButton = (
            <div className="cal-btn-wrapper">
                <button
                    //onClick={}
                    className="save-timetable add-button"
                    data-tip
                    data-for="add-btn-tooltip"
                >
                    <i className="fa fa-plus" />
                </button>
                <ReactTooltip
                    id="add-btn-tooltip"
                    class="tooltip"
                    type="dark"
                    place="bottom"
                    effect="solid"
                >
                    <span>Add to forum </span>
                </ReactTooltip>
            </div>
        );
        
        function advisorRow() {
            const { advisors } = this.props
            return (
                ( advisors != null) ?
                    (advisors.map((advisor) => {
                    return (
                        <div className="ad-row">
                            <p className="ad-name">
                                { advisor }
                                <div className="ad-icon">{addButton}</div>
                            </p>
                        </div>
                        )})
                    ) : <p> You currently are not connected to any advisors </p>

            )
        }



        return (
            <ClickOutHandler onClickOut={this.hideDropDown}>
                <div onMouseDown={this.toggleDropdown}>
                    { toggleAdvisorMenuBtn }
                </div>
                <div className={classNames('advisor-dropdown', { down: this.state.showDropdown })}>
                    <p style={{textAlign: "center"}}> Invite Advisors to Comment Forum </p>
                    <div className="ad-modal-wrapper">
                        { this.props.advisors ? <p>yes</p> : <p> You currently are not connected to any advisors </p>}
                    </div>
                </div>
            </ClickOutHandler>
        );
    }

}

export default AdvisorMenu;
