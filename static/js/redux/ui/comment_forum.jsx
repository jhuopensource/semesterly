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
import CommentInputContainer from './containers/comment_input_container';
import Transcript from './transcript';
import {getTranscriptCommentsBySemester} from '../constants/endpoints';
import AdvisorMenu from "./advisor_menu";


class CommentForum extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          semester_name: '',
          semester_year: '',
          transcript: null,
          comments: null,
          //TODO: Set this to list of student's advisors from SIS
          advisors: [
              { advisor: 'Yair Amir'},
              { advisor: 'Linda Moulton'},
              { advisor: 'Steven Marra'},
          ]
        };
    }

    fetchTranscript() {
      if (this.props.selected_semester != null) {
        let semester_name = this.props.selected_semester.toString().split(' ')[0];
        let semester_year = this.props.selected_semester.toString().split(' ')[1];

        fetch(getTranscriptCommentsBySemester(semester_name, semester_year))
          .then(response => response.json())
          .then(data => {
            this.setState({transcript: data.transcript});
            this.setState({comments: this.state.transcript.comments});
          });
      } else {
        this.setState({transcript: null});
        this.setState({comments: null});
      }
    }

    componentDidMount() {
      this.fetchTranscript();
    }

    componentDidUpdate(prevProps) {
      if(this.props.selected_semester !== prevProps.selected_semester) {
        this.fetchTranscript();
      }
    }

    render() {

        let transcript;
        if (this.state.transcript != null && this.state.comments != null) {
            transcript = <Transcript
                comments={this.state.comments}
            />;
        } else if (this.state.transcript === null) {
          transcript = <div className="empty-state"><h4> <p> No semester selected! </p> </h4></div>;
        } else {
          transcript = <div className="empty-state"><h4> <p> No comments yet! </p> </h4></div>;
        }

        return (
            <div className="comment-forum no-print">
                <div className="cf-name">
                    <h3 className="title"> Comments Forum </h3>
                </div>
                <AdvisorMenu advisors={this.state.advisors}/>
                <div className="as-header">{}</div>
                <div className="comment-forum-container">
                  { transcript }
                </div>
                <div className="as-header">{}</div>
                <CommentInputContainer />
            </div>
        );
    }
}

export default CommentForum;
