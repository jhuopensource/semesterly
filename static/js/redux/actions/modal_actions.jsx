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

import fetch from 'isomorphic-fetch';
import Cookie from 'js-cookie';
import {
  getClassmatesInCourseEndpoint,
  getCourseInfoEndpoint,
  getReactToCourseEndpoint,
} from '../constants/endpoints';
import { getSchool, getSemester } from '../actions/school_actions';
import * as ActionTypes from '../constants/actionTypes';
import { courseInfoActions } from '../state/slices';
import { setCourseReactions, setCourseInfo } from './initActions';

export const fetchCourseClassmates = courseId => (dispatch, getState) => {
  const state = getState();
  fetch(getClassmatesInCourseEndpoint(getSchool(state), getSemester(state), courseId), {
    credentials: 'include',
  })
    .then(response => response.json())
    .then((json) => {
      dispatch(courseInfoActions.courseClassmatesReceived(json));
    });
};

export const fetchCourseInfo = courseId => (dispatch, getState) => {
  dispatch(courseInfoActions.requestCourseInfo());
  fetch(getCourseInfoEndpoint(courseId, getSemester(getState())), {
    credentials: 'include',
  })
    .then(response => response.json())
    .then((json) => {
      dispatch(setCourseInfo(json));
    });
  dispatch(fetchCourseClassmates(courseId));
};

export const react = (cid, title) => (dispatch) => {
  fetch(getReactToCourseEndpoint(), {
    headers: {
      'X-CSRFToken': Cookie.get('csrftoken'),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      cid,
      title,
    }),
    credentials: 'include',
  })
    .then(response => response.json())
    .then((json) => {
      if (!json.error) {
        // TODO: remove below
        dispatch({
          id: cid,
          type: ActionTypes.SET_COURSE_REACTIONS,
          reactions: json.reactions,
        });
        dispatch(setCourseReactions({
          id: cid,
          reactions: json.reactions,
        }));
      }
    });
};

export const togglePreferenceModal = () => ({ type: ActionTypes.TOGGLE_PREFERENCE_MODAL });

export const triggerSaveCalendarModal = () => ({ type: ActionTypes.TRIGGER_SAVE_CALENDAR_MODAL });

export const toggleSaveCalendarModal = () => ({ type: ActionTypes.TOGGLE_SAVE_CALENDAR_MODAL });

export const openSignUpModal = () => ({ type: ActionTypes.TOGGLE_SIGNUP_MODAL });

export const hideExplorationModal = () => ({ type: ActionTypes.HIDE_EXPLORATION_MODAL });

export const showExplorationModal = () => ({ type: ActionTypes.SHOW_EXPLORATION_MODAL });

export const toggleIntegrationModal = () => ({ type: ActionTypes.TOGGLE_INTEGRATION_MODAL });

export const togglePeerModal = () => ({ type: ActionTypes.TOGGLE_PEER_MODAL });

export const triggerTermsOfServiceBanner = () => ({
  type: ActionTypes.TRIGGER_TOS_BANNER,
});

export const dismissTermsOfServiceBanner = () => ({
  type: ActionTypes.DISMISS_TOS_BANNER,
});

export const triggerTermsOfServiceModal = () => ({
  type: ActionTypes.TRIGGER_TOS_MODAL,
});
