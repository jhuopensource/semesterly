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
import {getTranscriptCommentsBySemester} from "../constants/endpoints";
import CommentInput from "./comment_input";

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
        const { semester_name, semester_year } = this.props;

        const toggleAdvisorMenuBtn = (
            <div style={{margin: "right", marginTop: "5px"}}>
                <button
                    className="save-timetable add-button"
                    data-for="add-btn-tooltip"
                >
                    <i className="fa fa-plus" />
                </button>
            </div>
        );

        function handleAdd(advisor, added) {
            fetch(getTranscriptCommentsBySemester(semester_name, semester_year, advisor), {
                method:  added === false  ? 'ADD' : 'REMOVE',
                body: JSON.stringify({
                    jhed: advisor
                })
            });
        }

        function addOrRemoveBtn(advisor, added) {
            let span = (!added ? 'Add Advisor' : 'Remove Advisor');
            return (
            <div style={{width:"30px"}}>
                <button
                    onClick={() => handleAdd(advisor, added)}
                    className="save-timetable add-button"
                    data-tip
                    data-for="add-btn-tooltip"
                >
                    {/*if (this.props.addedAdvisors)*/}
                    <i className={classNames('fa', { 'fa-plus': !added, 'fa-check': added })} />
                </button>

                <ReactTooltip
                    id="add-btn-tooltip"
                    class="tooltip"
                    type="dark"
                    place="bottom"
                    effect="solid"
                >
                  <span>{span}</span>
                </ReactTooltip>
            </div>
            );
        }

        let advisorList = (this.props.advisors.length > 0) ?
            this.props.advisors.map((advisor, i) => {
                return (<div key={i} style={{padding: "5px"}}>
                    {/* if name in addedAdvisors, removeBtn, else addBtn */}
                    {this.props.addedAdvisors.find((e) => e === advisor.jhed ) ? addOrRemoveBtn(advisor.jhed, true) : addOrRemoveBtn(advisor.jhed, false) }
                    <p style={{ marginLeft: "50px"}}> {advisor.name} </p>
                    </div>);
            }) : <p style={{textAlign: "center", fontSize:"10pt"}}> You are not connected to any advisors </p>;

        return (
            <ClickOutHandler onClickOut={this.hideDropDown}>
                <div onMouseDown={this.toggleDropdown}>
                    { toggleAdvisorMenuBtn }
                </div>
                <div className={classNames('advisor-dropdown', { down: this.state.showDropdown })}>
                    <p style={{maxWidth: "70%", fontWeight: "bold", margin: "auto", textAlign: "center", marginTop: "10px"}}>
                        Invite Advisors to Comment Forum
                    </p>
                    <div className="ad-modal-wrapper">
                        { advisorList }
                    </div>
                </div>
            </ClickOutHandler>
        );
    }

}


AdvisorMenu.propTypes = {
    semester_name: PropTypes.string.isRequired,
    semester_year: PropTypes.string.isRequired,
    advisors: PropTypes.array.isRequired,
    addedAdvisors: PropTypes.array.isRequired,
};

export default AdvisorMenu;
