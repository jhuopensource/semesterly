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

// import PropTypes from 'prop-types';
import React from 'react';
// import Cookie from 'js-cookie';
// import { getTranscriptsearchBarAdviseessBySemester } from '../constants/endpoints';
// import * as SemesterlyPropTypes from '../constants/semesterlyPropTypes';

class SearchAdviseesInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchBarAdvisees: '',
      // submitted: false
    };
  }

  componentDidUpdate() {
    // if (this.state.submitted === true ) {
    //   window.location.reload();
    //   this.state.submitted = !this.state.submitted;
    // }
  }

  sendContent(event) {
    this.setState({ searchBarAdvisees: event.target.value });
  }

  // submitContent(semesterName, semesterYear) {
  //   if (this.state.searchBarAdvisees !== '') {
  //     fetch(getTranscriptsearchBarAdviseessBySemester(semesterName, semesterYear), {
  //       method: 'POST',
  //       headers: {
  //         'X-CSRFToken': Cookie.get('csrftoken'),
  //         accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         jhed: this.props.userInfo.jhed,
  //         timestamp: new Date(Date.now()),
  //         content: this.state.searchBarAdvisees,
  //       })
  //     })
  //         .then(() =>
  // this.setState({searchBarAdvisees: this.state.searchBarAdvisees
  // = '', submitted: !this.state.submitted}));
  //   }
  // }

  render() {
    const { searchBarAdvisees } = this.state;

    return (<div className="search-bar">
      <form action="#0">
        <textarea
          className="search"
          rows="1"
          placeholder="Search for Student"
          value={searchBarAdvisees}
          onChange={event => this.sendContent(event)}
        />
      </form>
      <i className="fa fa-search" style={{ order: '2', marginLeft: '10px', marginTop: '5px' }} aria-hidden="true" />
    </div>
    );
  }
}

SearchAdviseesInput.propTypes = {
  // userInfo: SemesterlyPropTypes.userInfo.isRequired,
};

export default SearchAdviseesInput;
