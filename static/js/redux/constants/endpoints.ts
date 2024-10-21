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

import { FriendRequest, User } from "../ui/modals/PeerModalComponents/Types";
import { Course, Semester, Slot, Timetable } from "./commonTypes";

/* server endpoints */
export const getLogiCalEndpoint = () => "/user/log_ical/";
export const getCourseInfoEndpoint = (courseId: Course["id"], semester: string) =>
  `/courses/${semester}/id/${courseId}/`;
export const getCourseSearchEndpoint = (
  query: string,
  semester: string,
  page = 1,
  limit = 6
) => `/search/${semester}/${query}/?page=${page}&limit=${limit}`;
export const getTimetablesEndpoint = () => "/timetables/";
export const getLoadSavedTimetablesEndpoint = (semester: Semester) =>
  `/user/timetables/${semester.name}/${semester.year}/`;
export const getSaveTimetableEndpoint = () => "/user/timetables/";
export const getPersonalEventEndpoint = () => "/user/events/";
export const getDeleteTimetableEndpoint = (semester: Semester, name: string) =>
  `/user/timetables/${semester.name}/${semester.year}/${name}/`;
export const getTimetablePreferencesEndpoint = (id: Timetable["id"]) =>
  `/user/timetables/${id}/preferences/`;
export const getSaveSettingsEndpoint = () => "/user/settings/";
export const getClassmatesEndpoint = (
  semester: Semester,
  courses: Array<Slot["course"]>
) =>
  `/user/classmates/${semester.name}/${semester.year}?${$.param({
    course_ids: courses,
  })}`;
export const getClassmatesInCourseEndpoint = (
  school: string,
  semester: string,
  courseId: Course["id"]
) => `/course_classmates/${school}/${semester}/id/${courseId}/`;
export const getMostClassmatesCountEndpoint = (
  semester: Semester,
  courses: Array<Slot["course"]>
) =>
  `/user/classmates/${semester.name}/${semester.year}?${$.param({
    course_ids: courses,
    count: true,
  })}`;
export const getFriendsEndpoint = (semester: Semester) =>
  `/user/classmates/${semester.name}/${semester.year}/`;

// Friends endpoints
export const getFetchFriendsEndpointEndpoint = () => `/friends/`;
export const getRemoveFriendEndpoint = (userId: User["userId"]) =>
  `/friends/remove/${userId}`;
export const getSearchFriendsEndpoint = (query: string) => `/friends/search/${query}`;
export const getSendFriendRequestEndpoint = (userId: User["userId"]) =>
  `/friends/send_request/${userId}`;
export const getFriendRequestsSentEndpoint = () => `/friends/requests_sent`;
export const getFriendRequestsReceivedEndpoint = () => `friends/requests_received`;
export const getAcceptFriendRequestEndpoint = (
  friendRequestId: FriendRequest["friendRequestId"]
) => `/friends/accept_request/${friendRequestId}`;
export const getRejectFriendRequestEndpoint = (
  friendRequestId: FriendRequest["friendRequestId"] | string
) => `/friends/reject_request/${friendRequestId}`;

export const getSchoolInfoEndpoint = (school: string) => `/school/${school}/`;
export const getReactToCourseEndpoint = () => "/user/reactions/";
export const getRequestShareTimetableLinkEndpoint = () => "/timetables/links/";
export const acceptTOSEndpoint = () => "/tos/accept/";
export function getCourseShareLinkFromModal(
  code: Course["code"] | number,
  semester: Semester
) {
  return `/course/${encodeURIComponent(code)}/${semester.name}/${semester.year}`;
}
// TODO: ${window.location.href.split('/')[2]} insert above ^

export function getCourseShareLink(code: Course["code"] | number, semester: Semester) {
  return `/course/${encodeURIComponent(code)}/${semester.name}/${semester.year}`;
}

export const getNewsEndpoint = () => "/notifications/news";
export const getUIErrorLogEndpoint = () => "/ui-error-logs/";
