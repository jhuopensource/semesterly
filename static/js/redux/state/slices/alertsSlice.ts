import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { alertConflict, alertTimeTableExists } from "../../actions/initActions";
import { Timetable } from "../../constants/commonTypes";

/* eslint no-shadow: "off" */

export enum AlertCoursePlanType {
  EMPTY = 0,
  EXCEEDS_LIMIT = 1,
  NO_FEASIBLE_SCHEDULE = 2,
  UNKNOWN = 3,
}

interface AlertsSliceState {
  alertConflict: boolean;
  alertDeleteTimetable: boolean;
  alertTimetableExists: boolean;
  alertChangeSemester: boolean;
  alertNewTimetable: boolean;
  mostFriendsClassId: null | number;
  mostFriendsCount: number;
  totalFriendsCount: number;
  desiredSemester: number;
  timetableToDelete: null | Timetable;
  alertCoursePlan: boolean;
  alertCoursePlanType: number;
  alertUploadIssue: boolean;
  uploadIssueMessage: string;
}

const initialState: AlertsSliceState = {
  alertConflict: false,
  alertDeleteTimetable: false,
  alertTimetableExists: false,
  alertChangeSemester: false,
  alertNewTimetable: false,
  mostFriendsClassId: null,
  mostFriendsCount: 0,
  totalFriendsCount: 0,
  desiredSemester: 0,
  timetableToDelete: null,
  alertCoursePlan: false,
  alertCoursePlanType: 0,
  alertUploadIssue: false,
  uploadIssueMessage: "",
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    // dispatched when there's a conflict
    dismissAlertConflict: (state) => {
      state.alertConflict = false;
    },
    // dispatched when a user attempts to delete a timetable
    alertDeleteTimetable: (state, action: PayloadAction<Timetable>) => {
      state.alertDeleteTimetable = true;
      state.timetableToDelete = action.payload;
    },
    dismissDeleteTimetable: (state) => {
      state.alertDeleteTimetable = false;
    },
    // dispatched there's a saved timetable with the same name
    dismissTimeTableExists: (state) => {
      state.alertTimetableExists = false;
    },
    // dispatched when the user tries to change semester,
    // while having an unsaved timetable (if logged in), or
    // if they're logged out, since while logged out their timetable is cleared
    alertChangeSemester: (state, action: PayloadAction<number>) => {
      state.alertChangeSemester = true;
      state.desiredSemester = action.payload;
    },
    dismissAlertChangeSemester: (state) => {
      state.alertChangeSemester = false;
    },
    // dispatched when the user tries to create a new timetable but the current one is unsaved
    alertNewTimeTable: (state) => {
      state.alertNewTimetable = true;
    },
    dismissAlertNewTimeTable: (state) => {
      state.alertNewTimetable = false;
    },
    // dispatched when the most friended class is returned
    changeMostFriendsClass: (
      state,
      action: PayloadAction<{
        mostFriendsCount: number;
        mostFriendsClassId: number;
        totalFriendsCount: number;
      }>
    ) => {
      state.mostFriendsCount = action.payload.mostFriendsCount;
      state.mostFriendsClassId = action.payload.mostFriendsClassId;
      state.totalFriendsCount = action.payload.totalFriendsCount;
    },

    // New reducer for empty schedule alert
    alertCoursePlan: (
      state,
      action: PayloadAction<{ alertType: AlertCoursePlanType }>
    ) => {
      state.alertCoursePlan = true;
      state.alertCoursePlanType = action.payload.alertType;
    },
    dismissAlertCoursePlan: (state) => {
      state.alertCoursePlan = false;
    },
    // failure to upload transcript
    alertUploadFailed: (state, action: PayloadAction<string | undefined>) => {
      state.alertUploadIssue = true;
      state.uploadIssueMessage =
        action.payload || "File upload failed. Please try again.";
    },
    dismissAlertUploadIssue: (state) => {
      state.alertUploadIssue = false;
      state.uploadIssueMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(alertConflict, (state) => {
        state.alertConflict = true;
      })
      .addCase(alertTimeTableExists, (state) => {
        state.alertTimetableExists = true;
      });
  },
});

export const alertsActions = alertsSlice.actions;
export default alertsSlice.reducer;
