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

import React from 'react';
import PropTypes from 'prop-types';
import * as SemesterlyPropTypes from '../constants/semesterlyPropTypes';
import InviteAdvisorsModalContainer from './containers/modals/invite_advisors_modal_container';
import ReactTooltip from 'react-tooltip';
import CommentSlot from './comment_slot';
import {getNextAvailableColour} from '../util';
import TextInputContainer from './containers/text_input_container';


class CommentForum extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let commentSlots = this.props.ownedComments ?
            this.props.ownedComments.map((content) => {
                const colourIndex = (course.id in this.props.courseToColourIndex) ?
                    this.props.courseToColourIndex[course.id] :
                    getNextAvailableColour(this.props.courseToColourIndex);
                //TODO: Add info from backend
                //const author = course.comment.map(comment => comment.author);
                return(<CommentSlot
                    // key={course.id}
                    // author={author}
                    // colourIndex={colourIndex}
                    // fetchCourseInfo={() => this.props.fetchCourseInfo(course.id)}
                />);
            }) : <div> <p> No messages yet! </p> </div>;
        const addButton = (
            <div className="cal-btn-wrapper">
                <button
                    onClick={this.props.toggleInviteAdvisorsModal}
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
                    <span>Invite Advisors</span>
                </ReactTooltip>
            </div>
        );
        return (
            <div className="comment-forum no-print">
                <div className="cf-name">
                    <p style={{fontSize: "1.25em", fontWeight: "bold", marginTop: "70px" }}>
                        Comments Forum</p>
                </div>
                <InviteAdvisorsModalContainer/>
                { addButton }
                <div className="as-header"></div>
                { commentSlots }
                <CommentSlot
                    // key={course.id}
                    // author={author}
                    //colourIndex={colourIndex}
                    // fetchCourseInfo={() => this.props.fetchCourseInfo(course.id)}
                />
                {/* need to use similar css to search bar for forum input box */}
                <TextInputContainer />
                <button className="accept-tos-btn"
                        style={{position: "fixed", right: "20px", bottom: "20px"}}>
                    Submit
                </button>
            </div>)


    }
}

CommentForum.defaultProps = {
    invitedComments: null,
    ownedComments: null,
}


CommentForum.propTypes = {
    toggleInviteAdvisorsModal: PropTypes.func.isRequired,
    //invitedComments: PropTypes.arrayOf(SemesterlyPropTypes.userInfo.invited_transcripts).isRequired,
    //ownedComments: PropTypes.arrayOf(SemesterlyPropTypes.userInfo.owned_transcripts).isRequired,
};

export default CommentForum;
