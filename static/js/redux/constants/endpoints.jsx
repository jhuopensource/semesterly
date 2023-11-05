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

/* server endpoints */
export const getLogiCalEndpoint = () => "/user/log_ical/";
export const getCourseInfoEndpoint = (courseId, semester) =>
  `/courses/${semester}/id/${courseId}/`;
export const getCourseSearchEndpoint = (query, semester, page = 1, limit = 6) =>
  `/search/${semester}/${query}/?page=${page}&limit=${limit}`;
export const getTimetablesEndpoint = () => "/timetables/";
export const getLoadSavedTimetablesEndpoint = (semester) =>
  `/user/timetables/${semester.name}/${semester.year}/`;
export const getSaveTimetableEndpoint = () => "/user/timetables/";
export const getPersonalEventEndpoint = () => "/user/events/";
export const getDeleteTimetableEndpoint = (semester, name) =>
  `/user/timetables/${semester.name}/${semester.year}/${name}/`;
export const getTimetablePreferencesEndpoint = (id) =>
  `/user/timetables/${id}/preferences/`;
export const getSaveSettingsEndpoint = (userId) => `/user/${userId}/settings/`;
export const getClassmatesEndpoint = (semester, courses) =>
  `/user/classmates/${semester.name}/${semester.year}?${$.param({
    course_ids: courses,
  })}`;
export const getClassmatesInCourseEndpoint = (school, semester, courseId) =>
  `/course_classmates/${school}/${semester}/id/${courseId}/`;
export const getMostClassmatesCountEndpoint = (semester, courses) =>
  `/user/classmates/${semester.name}/${semester.year}?${$.param({
    course_ids: courses,
    count: true,
  })}`;
export const getFriendsEndpoint = (semester) =>
  `/user/classmates/${semester.name}/${semester.year}/`;
export const getSchoolInfoEndpoint = (school) => `/school/${school}/`;
export const getReactToCourseEndpoint = () => "/user/reactions/";
export const getRequestShareTimetableLinkEndpoint = () => "/timetables/links/";
export const acceptTOSEndpoint = () => "/tos/accept/";
export function getCourseShareLinkFromModal(code, semester) {
  return `/course/${encodeURIComponent(code)}/${semester.name}/${semester.year}`;
}
// TODO: ${window.location.href.split('/')[2]} insert above ^

export function getCourseShareLink(code, semester) {
  return `/course/${encodeURIComponent(code)}/${semester.name}/${semester.year}`;
}

export const getNewsEndpoint = () => "/notifications/news";
export const getUIErrorLogEndpoint = () => "/ui-error-logs/";
