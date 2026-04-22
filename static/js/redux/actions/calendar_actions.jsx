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

import ical from "ical-generator";
import Cookie from "js-cookie";
import FileSaver from "browser-filesaver";
import {
  // getAddTTtoGCalEndpoint,
  getLogiCalEndpoint,
  getGhostTimetableEndpoint,
  getGhostTimetableWebsocketEndpoint,
  getRequestShareTimetableLinkEndpoint,
  getCourseShareLink,
} from "../constants/endpoints";
import { FULL_WEEK_LIST } from "../constants/constants";
import {
  getCurrentSemester,
  getActiveDenormTimetable,
  getActiveTimetable,
} from "../state";
import { calendarActions } from "../state/slices";
import { ghostTimetableActions } from "../state/slices/ghostTimetableSlice";
import { saveCalendarModalActions } from "../state/slices/saveCalendarModalSlice";
import { receiveCourses } from "./initActions";

let ghostTimetableSocket = null;

const DAY_MAP = {
  M: "mo",
  T: "tu",
  W: "we",
  R: "th",
  F: "fr",
  S: "sa",
  U: "su",
};

export const getNextDayOfWeek = (date, dayOfWeek) => {
  const dayIndex = FULL_WEEK_LIST.indexOf(dayOfWeek);
  const resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + ((7 + (dayIndex - date.getDay())) % 7));
  return resultDate;
};

export const receiveShareLink = (shareLink) => (dispatch) => {
  dispatch(calendarActions.receiveShareTimetableLink(shareLink));
};

export const fetchShareTimetableLink = () => (dispatch, getState) => {
  const state = getState();

  const semester = getCurrentSemester(state);
  const { shareLink, shareLinkValid } = state.calendar;
  dispatch(calendarActions.requestShareTimetableLink());
  if (shareLinkValid) {
    receiveShareLink(shareLink);
    return;
  }
  fetch(getRequestShareTimetableLinkEndpoint(), {
    headers: {
      "X-CSRFToken": Cookie.get("csrftoken"),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      timetable: getActiveTimetable(state),
      semester,
    }),
    credentials: "include",
  })
    .then((response) => response.json())
    .then((ref) => {
      dispatch(receiveShareLink(`/timetables/links/${ref.slug}`));
    });
};

export const fetchGhostTimetableBySlug = (slug) => (dispatch) => {
  dispatch(ghostTimetableActions.startGhostLoad(slug));
  return fetch(getGhostTimetableEndpoint(slug), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      if (response.status !== 200) {
        throw new Error("Unable to load ghost timetable");
      }
      return response.json();
    })
    .then((payload) => applyGhostTimetablePayload(dispatch, payload))
    .catch(() => {
      dispatch(
        ghostTimetableActions.setGhostError(
          "Could not load shared timetable overlay."
        )
      );
      return null;
    });
};

export const disconnectGhostTimetableSocket = () => (dispatch) => {
  if (ghostTimetableSocket !== null) {
    ghostTimetableSocket.close();
    ghostTimetableSocket = null;
  }
  dispatch(ghostTimetableActions.setGhostWebsocketConnected(false));
};

export const connectGhostTimetableSocket = (slug) => (dispatch) => {
  dispatch(disconnectGhostTimetableSocket());
  try {
    ghostTimetableSocket = new WebSocket(getGhostTimetableWebsocketEndpoint(slug));
  } catch (error) {
    dispatch(
      ghostTimetableActions.setGhostError(
        "Could not connect to live ghost updates."
      )
    );
    return;
  }

  ghostTimetableSocket.onopen = () => {
    dispatch(ghostTimetableActions.setGhostWebsocketConnected(true));
  };
  ghostTimetableSocket.onclose = () => {
    dispatch(ghostTimetableActions.setGhostWebsocketConnected(false));
  };
  ghostTimetableSocket.onerror = () => {
    dispatch(
      ghostTimetableActions.setGhostError("Live updates disconnected unexpectedly.")
    );
  };
  ghostTimetableSocket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === "timetable.updated") {
        if (payload.sharedTimetable && payload.courses) {
          applyGhostTimetablePayload(dispatch, payload);
          return;
        }
        // Backward-compatible fallback while websocket payload rolls out.
        dispatch(fetchGhostTimetableBySlug(slug));
      }
    } catch (error) {
      // Ignore malformed events and keep stream alive.
    }
  };
};

const applyGhostTimetablePayload = (dispatch, payload) => {
  dispatch(receiveCourses(payload.courses));
  dispatch(
    ghostTimetableActions.receiveGhostTimetable({
      slug: payload.slug,
      timetable: payload.sharedTimetable,
      permission: payload.permission || "view",
      updatedAt: payload.updatedAt || null,
    })
  );
  return payload;
};

export const startGhostOverlay = (slug) => (dispatch) =>
  dispatch(fetchGhostTimetableBySlug(slug)).then((payload) => {
    if (payload) {
      dispatch(connectGhostTimetableSocket(payload.slug));
    }
  });

export const stopGhostOverlay = () => (dispatch) => {
  dispatch(disconnectGhostTimetableSocket());
  dispatch(ghostTimetableActions.clearGhostOverlay());
};

export const fetchSISTimetableData = () => (dispatch, getState) => {
  const state = getState();
  const tt = getActiveDenormTimetable(state);
  const sem = getCurrentSemester(state);
  const sections = tt.slots.map((slot) => ({
    course: slot.course.code,
    section: slot.section.meeting_section.replace("(", "").replace(")", ""),
    course_section_id: slot.section.course_section_id,
  }));
  const sisData = {
    action: "AddToCart",
    data: {
      year: sem.year,
      term: sem.name,
      sections,
    },
  };
  return sisData;
};

export const createICalFromTimetable = () => (dispatch, getState) => {
  const state = getState();
  if (
    !state.saveCalendarModal.isDownloading &&
    !state.saveCalendarModal.hasDownloaded
  ) {
    dispatch(saveCalendarModalActions.downloadCalendar());
    const cal = ical({ domain: "https://semester.ly", name: "My Semester Schedule" });
    const tt = getActiveDenormTimetable(state);

    // TODO - MUST BE REFACTORED AFTER CODED IN TO CONFIG
    let semStart = new Date();
    let semEnd = new Date();
    const semester = getCurrentSemester(state);

    if (semester.name === "Fall") {
      // ignore year, year is set to current year
      semStart = new Date(`August 30 ${semester.year} 00:00:00`);
      semEnd = new Date(`December 20 ${semester.year} 00:00:00`);
    } else {
      // ignore year, year is set to current year
      semStart = new Date(`January 30 ${semester.year} 00:00:00`);
      semEnd = new Date(`May 20 ${semester.year} 00:00:00`);
    }

    semStart.setYear(new Date().getFullYear());
    semEnd.setYear(new Date().getFullYear());

    tt.slots.forEach((slot) => {
      const { course, section, offerings } = slot;
      const description = course.description || "";
      offerings.forEach((offering) => {
        const instructors =
          section.instructors && section.instructors.length > 0
            ? `Taught by: ${section.instructors}\n`
            : "";
        const start = getNextDayOfWeek(semStart, offering.day);
        const [startHours, startMinutes] = offering.time_start.split(":");
        start.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));

        const end = getNextDayOfWeek(semStart, offering.day);
        const [endHours, endMinutes] = offering.time_end.split(":");
        end.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));

        const event = cal.createEvent({
          start,
          end,
          summary: `${course.name} ${course.code}${section.meeting_section}`,
          description: `${
            course.code + section.meeting_section
          }\n${instructors}${description}`,
          location: offering.location,
          url: getCourseShareLink(slot.code, getCurrentSemester(state)),
        });

        event.repeating({
          freq: "WEEKLY",
          byDay: DAY_MAP[offering.day],
          until: getNextDayOfWeek(semEnd, offering.day),
        });
      });
    });

    const file = new Blob([cal.toString()], {
      type: "data:text/calendar;charset=utf8,",
    });
    FileSaver.saveAs(file, "my_semester.ics");
    fetch(getLogiCalEndpoint(), {
      method: "POST",
      credentials: "include",
    });
    dispatch(saveCalendarModalActions.calendarDownloaded());
  }
};
