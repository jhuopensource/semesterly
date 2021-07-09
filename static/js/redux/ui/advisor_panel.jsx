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
// import * as SemesterlyPropTypes from '../constants/semesterlyPropTypes';
import SearchAdviseesInputContainer from '../ui/containers/search_advisees_input_container';

class AdvisorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newSelectedAdvisee: null,
    };
  }

  sendSelectedAdvisee(newSelectedAdvisee) {
    this.props.displayAdvisee(newSelectedAdvisee);
  }

  render() {
    // TODO: fix search bar so it works, test with multiple students
    const searchAdviseesInput = (this.props.displayed_advisees === null) ?
      null : (<SearchAdviseesInputContainer
        displayed_advisees={this.props.displayed_advisees}
        selected_advisee={this.props.selected_advisee}
        displayAdvisee={this.props.displayAdvisee}
      />);

    // TODO: add unread comment note under student name (insert in div below)
    const adviseeList = (this.props.displayed_advisees != null) ?
    this.props.displayed_advisees.map(advisee =>
      (<div
        className="advisee-container"
        onClick={
          () => { this.sendSelectedAdvisee(advisee); }
        }
        key={advisee.owner_jhed}
      >
        { advisee.owner_name }
      </div>),
    ) : (<div className="empty-state"><h4> <p> No advisees added yet! </p> </h4></div>);

    return (
      <div className="comment-forum no-print">
        <div className="cf-name">
          <h3 className="comment-title"> Students </h3>
        </div>
        { searchAdviseesInput }
        <div className="cf-header" />
        <div className="comment-forum-container">
          { adviseeList }
        </div>
      </div>
    );
  }
}

AdvisorPanel.defaultProps = {
  selected_advisee: null,
  displayed_advisees: null,
};

AdvisorPanel.propTypes = {
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
  displayed_advisees: PropTypes.arrayOf(PropTypes.object),
  displayAdvisee: PropTypes.func.isRequired,
};

export default AdvisorPanel;
