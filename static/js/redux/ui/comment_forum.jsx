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
import ReactTooltip from 'react-tooltip';
import Cookie from 'js-cookie';
import AdvisorMenu from './advisor_menu';
import * as SemesterlyPropTypes from '../constants/semesterlyPropTypes';
import { postTranscriptCommentsBySemester } from '../constants/endpoints';

class CommentForum extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: `${this.props.userInfo.userFirstName} ${this.props.userInfo.userLastName}`,
      comment: '',
    };
  }

  sendContent(event) {
    this.setState({ comment: event.target.value });
  }

  submitContent(semesterName, semesterYear) {
    if (this.state.comment !== '') {
      fetch(postTranscriptCommentsBySemester(semesterName, semesterYear), {
        method: 'POST',
        headers: {
          'X-CSRFToken': Cookie.get('csrftoken'),
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jhed: (this.props.userInfo.isAdvisor) ? this.props.selected_advisee.owner_jhed :
            this.props.userInfo.jhed,
          timestamp: new Date(Date.now()),
          content: this.state.comment,
        }),
      }).then(() => {
        this.setState({ comment: this.state.comment = '' });
        this.props.reloadComponent(this.props.selected_semester);
      });
    }
  }

  render() {
    const semesterName = (this.props.selected_semester) ?
      this.props.selected_semester.toString().split(' ')[0] : null;
    const semesterYear = (this.props.selected_semester) ?
      this.props.selected_semester.toString().split(' ')[1] : null;
    const { userInfo } = this.props;
    let transcript;
    if (this.props.transcript != null && this.props.transcript.comments != null) {
      transcript = this.props.transcript.comments.map((comment) => {
        const timestamp = new Date(comment.timestamp);
        const ownerView = (this.state.userName === comment.author_name) ?
          (<span className="comment-row">
            <div className="comment-bubble owner">
              <div className="author">
                {comment.author_name}
              </div>
              <div>
                {comment.content}
              </div>
            </div>
            <div className="comment-timestamp">
              {timestamp.toDateString()},
              {timestamp.toLocaleTimeString()}
            </div>
          </span>) :
          (<span className="comment-row">
            <div className="comment-bubble guest">
              <div className="author">
                {comment.author_name}
              </div>
              <div className="comment-content">
                {comment.content}
              </div>
            </div>
            <div className="comment-timestamp" style={{ float: 'left' }}>
              {timestamp.toDateString()},
              {timestamp.toLocaleTimeString()}
            </div>
          </span>);
        return (<span key={timestamp}>
          {ownerView}
        </span>);
      });
    } else if (this.props.transcript === null) {
      transcript = <div className="empty-state"><h4> <p> No semester selected! </p> </h4></div>;
    } else if (this.props.transcript.comments === null) {
      transcript = <div className="empty-state"><h4> <p> No comments yet! </p> </h4></div>;
    }

    const displayInput = (this.props.selected_semester) ? (<div className="cf-text-input">
      <form action="#0">
        <textarea
          className="cf-input"
          rows="1" placeholder="Type your comment here..."
          value={this.state.comment}
          onChange={event => this.sendContent(event)}
          onKeyPress={(event) => {
            if (event.keyCode === 13) { this.submitContent(semesterName, semesterYear); }
          }
          }
        />
        <input
          className="send-btn"
          type="submit"
          value="&#10148;"
          onClick={() => this.submitContent(semesterName, semesterYear)}
        />
      </form>
    </div>) : null;


    const backButton = (userInfo.isAdvisor === true) ? (
      <div className="cal-btn-wrapper" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <a href="/advising">
          <button
            data-tip
            className="save-timetable add-button"
            data-for="back-btn-tooltip"
          >
            <span className="tip-left" />
          </button>
        </a>
        <ReactTooltip
          id="back-btn-tooltip"
          class="tooltip"
          type="dark"
          place="right"
          effect="solid"
        >
          <span>Back</span>
        </ReactTooltip>
      </div>
    ) : null;

    const displayAdvisorNames = () => {
      const names = [];
      const advisorList = (this.props.transcript) ? this.props.transcript.advisors : [];
      advisorList.forEach(advisor => names.push(advisor.full_name));
      return names.join(', ');
    };

    return (
      <div className="comment-forum no-print">
        <div className="cf-name">
          {/* TODO: fix the CSS styling, change title css */}
          <h3 className="comment-title">
            {backButton} Comments Forum
          </h3>
        </div>
        {!this.props.userInfo.isAdvisor && this.props.selected_semester &&
          <AdvisorMenu
            semester={this.props.selected_semester}
            advisors={userInfo.advisors}
            transcript={this.props.transcript}
            addAdvisor={this.state.addAdvisor}
            addRemoveAdvisor={this.props.addRemoveAdvisor}
          />
        }
        <div className="cf-header">{this.props.selected_semester && displayAdvisorNames()}</div>
        <div className="comment-forum-container">
          {transcript}
        </div>
        <div className="as-header" />
        {displayInput}
      </div>
    );
  }
}

CommentForum.defaultProps = {
  selected_semester: null,
  selected_advisee: null,
  transcript: null,
};

CommentForum.propTypes = {
  userInfo: SemesterlyPropTypes.userInfo.isRequired,
  addRemoveAdvisor: PropTypes.func.isRequired,
  selected_semester: PropTypes.string,
  selected_advisee: PropTypes.shape({
    owner_name: PropTypes.string,
    owner_jhed: PropTypes.string,
    comments: PropTypes.arrayOf(PropTypes.shape({
      author_name: PropTypes.string,
      content: PropTypes.string,
      timestamp: PropTypes.date,
    })),
    semester_name: PropTypes.string,
    semester_year: PropTypes.string,
  }),
  transcript: SemesterlyPropTypes.transcript,
  reloadComponent: PropTypes.func.isRequired,
};

export default CommentForum;
