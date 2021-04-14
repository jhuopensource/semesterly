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
import PropTypes from 'prop-types';
import AdvisorMenu from "./advisor_menu";
import Cookie from "js-cookie";
import Comment from './comment';


let semester_name;
let semester_year;

class CommentForum extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          semester_name: '',
          semester_year: '',
          transcript: null,
          comments: null,
          addedAdvisors: [
              'yamir',
              'lmoulton'
          ],
          //TODO: Set this to list of student's advisors from SIS
          advisors: [
              {
                  name: 'Yair Amir',
                  jhed: 'yamir'
              },
              {
                  name: 'Linda Moulton',
                  jhed: 'lmoulton'
              },
              {
                  name: 'Steven Marra',
                  jhed: 'smarra'
              },
          ]

        };
    }

    fetchTranscript() {
      if (this.props.selected_semester != null) {
        semester_name = this.props.selected_semester.toString().split(' ')[0];
        semester_year = this.props.selected_semester.toString().split(' ')[1];

        fetch(getTranscriptCommentsBySemester(semester_name, semester_year))
          .then(response => response.json())
          .then(data => {
            this.setState({ transcript: data.transcript });
            this.setState({ comments: this.state.transcript.comments });
            //this.setState({ addedAdvisors: this.state.transcript.advisors });
          });
      } else {
        this.setState({ transcript: null });
        this.setState({ comments: null });
      }
    }

    addRemoveAdvisor(advisor, added) {
        fetch(getTranscriptCommentsBySemester(semester_name, semester_year, advisor), {
            method:  'PATCH',
            headers: {
                'X-CSRFToken': Cookie.get('csrftoken'),
                accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jhed: advisor,
                action: !added ? 'add' : 'remove'
            })
        });

        // just for frontend testing
        const { addedAdvisors } = this.state;
        if (added) {
            const indexToRemove = addedAdvisors.indexOf(advisor);
            if (indexToRemove !== -1) {
                addedAdvisors.splice(indexToRemove, 1);
            }
        } else {
            addedAdvisors.push(advisor);
        }
        this.setState({ addedAdvisors });
    }

    componentDidMount() {
      this.fetchTranscript();
    }

    componentDidUpdate(prevProps) {
      if (this.props.selected_semester !== prevProps.selected_semester) {
        this.fetchTranscript();
      }
    }

    render() {
      let transcript;
      if (this.props.transcript != null && this.props.transcript.comments != null) {
        transcript = this.props.transcript.comments.map(comment => (
            <Comment
                key={comment.timestamp}
                author={comment.author_name}
                content={comment.content}
                timestamp={comment.timestamp}
            />
        ));
      } else if (this.props.transcript === null) {
        transcript = <div className="empty-state"><h4> <p> No semester selected! </p> </h4></div>;
      } else if (this.props.transcript.comments === null) {
        transcript = <div className="empty-state"><h4> <p> No comments yet! </p> </h4></div>;
      }

    const displayInput = (this.props.selected_semester === null) ? null : (<CommentInputContainer
        semester_name={this.props.selected_semester.toString().split(' ')[0]}
        semester_year={this.props.selected_semester.toString().split(' ')[1]}
    />);


    const displayAdvisorNames = () => {
        const names = []
        const { advisors, addedAdvisors } = this.state
        advisors.forEach(({ jhed, name }) => {
          if (addedAdvisors.includes(jhed)) names.push(name)
        })
        return names.join(", ")
      }

      return (
        <div className="comment-forum no-print">
          <div className="cf-name">
            <h3 className="title"> Comments Forum </h3>
          </div>
          {this.props.transcript &&
          <AdvisorMenu
            semester_name={semester_name}
            semester_year={semester_year}
            advisors={this.state.advisors}
            addedAdvisors={this.state.addedAdvisors}
            addAdvisor={this.state.addAdvisor}
            addRemoveAdvisor={this.addRemoveAdvisor.bind(this)}
          />
          }
          <div className="as-header">{displayAdvisorNames()}</div>
          <div className="comment-forum-container">
            { transcript }
          </div>
          <div className="as-header">{}</div>
          { displayInput }
        </div>
      );
    }
}

CommentForum.defaultProps = {
  selected_semester: null,
  transcript: null,
};

CommentForum.propTypes = {
  // displayed_semester: PropTypes.string.isRequired,
  selected_semester: PropTypes.string,
  transcript: PropTypes.shape({
    semester_name: PropTypes.string,
    semester_year: PropTypes.string,
    owner: PropTypes.string,
    comments: PropTypes.arrayOf(PropTypes.shape({
      author_name: PropTypes.string,
      content: PropTypes.string,
      timestamp: PropTypes.date,
    })),
  }),
};


export default CommentForum;
