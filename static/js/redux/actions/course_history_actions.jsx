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

/* eslint camelcase: "off" */

import fetch from "isomorphic-fetch";
import Cookie from "js-cookie";
import { alertsActions } from "../state/slices";
import { getTranscriptEndpoint, postTranscriptEndpoint } from "../constants/endpoints";

export const ensureCsrfCookie = () =>
  fetch(getTranscriptEndpoint(), {
    method: "GET",
    credentials: "include",
  });

// POST a transcript to the backend for parsing
export const postTranscript = (formData) => (dispatch) => {
  const csrfToken = Cookie.get("csrftoken");
  // console.log("CSRF Token:", csrfToken);

  return fetch(postTranscriptEndpoint(), {
    method: "POST",
    body: formData,
    headers: {
      "X-CSRFToken": csrfToken,
    },
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        // console.error("Transcript upload failed:", response);
        throw new Error("Transcript upload failed");
      }
      return response.json();
    })
    .then((data) => data)
    .catch((error) => {
      dispatch(alertsActions.alertUploadFailed());
      throw error;
    });
};
