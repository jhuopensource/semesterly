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

import fetch from "isomorphic-fetch";
import { getActiveTimetableCourses, getCurrentSemester } from "../state";
import { getCourseSearchEndpoint } from "../constants/endpoints";
import { getUserSavedTimetables, saveTimetable } from "./user_actions";
import { nullifyTimetable } from "./timetable_actions";
import { fetchCourseClassmates } from "./modal_actions";
import { getSemester } from "./school_actions";
import { alertsActions, explorationModalActions } from "../state/slices";
import { semesterActions } from "../state/slices/semesterSlice";
import {
  receiveAdvancedSearchResults,
  requestCourses,
  receiveSearchResults,
} from "./initActions";

export const setSemester = (semester) => (dispatch, getState) => {
  const state = getState();

  if (state.userInfo.data.isLoggedIn) {
    dispatch(getUserSavedTimetables(state.semester.all[semester]));
  } else {
    dispatch(nullifyTimetable(dispatch));
  }

  dispatch(semesterActions.updateSemester(semester));
  dispatch(receiveSearchResults([]));
};

/*
 * Check whether the user is logged in and whether their timetable is up to date
 * and set semester if appropriate. Otherwise show an alert modal and save the
 * semester they were trying to switch to in the modal state.
 */
export const maybeSetSemester = (semester) => (dispatch, getState) => {
  const state = getState();

  if (semester === state.semester.current) {
    return null;
  }

  if (getActiveTimetableCourses(state).length > 0) {
    if (state.userInfo.data.isLoggedIn && !state.savingTimetable.upToDate) {
      return dispatch(saveTimetable(false, () => dispatch(setSemester(semester))));
    } else if (state.userInfo.data.isLoggedIn) {
      dispatch(setSemester(semester));
    } else {
      dispatch(alertsActions.alertChangeSemester(semester));
    }
  } else {
    dispatch(setSemester(semester));
  }
  return null;
};

export const fetchSearchResults = (query) => (dispatch, getState) => {
  if (query.length <= 1) {
    dispatch(receiveSearchResults([]));
    return;
  }
  dispatch(requestCourses());
  const state = getState();
  const seqNumber = state.searchResults.seqNumber;
  fetch(getCourseSearchEndpoint(query, getSemester(state)), {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((json) => {
      if (getState().searchResults.seqNumber === seqNumber) {
        // this is most recent request
        dispatch(receiveSearchResults(json));
      }
    });
};

export const fetchAdvancedSearchResults =
  (query, filters, page = 1) =>
  (dispatch, getState) => {
    // if too small a query AND no filters; don't make request.
    // we'll allow small query strings if some filters
    // (departments, or breadths, or levels) are chosen.
    if (query.length <= 1 && [].concat(...Object.values(filters)).length === 0) {
      dispatch(receiveAdvancedSearchResults({ data: [], page }));
      return;
    }

    // indicate that we are now requesting courses
    dispatch(explorationModalActions.requestAdvancedSearchResults());
    // send a request (via fetch) to the appropriate endpoint to get courses
    const state = getState();
    fetch(getCourseSearchEndpoint(query, getSemester(getState()), page), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      method: "POST",
      body: JSON.stringify({
        filters,
        semester: getCurrentSemester(state),
      }),
    })
      .then((response) => response.json()) // TODO(rohan): error-check the response
      .then((json) => {
        // indicate that courses have been received
        dispatch(receiveAdvancedSearchResults(json));
      });
  };

export const setAdvancedSearchResultIndex = (idx, courseId) => (dispatch) => {
  dispatch(explorationModalActions.setActiveAdvancedSearchResult(idx));
  dispatch(fetchCourseClassmates(courseId));
};
