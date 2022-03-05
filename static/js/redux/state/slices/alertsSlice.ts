import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { alertConflict, alertTimeTableExists } from "../../actions/initActions";
import { Timetable } from "../../constants/commonTypes";
import TimetableExistsAlert from "../../ui/alerts/timetable_exists_alert";

interface AlertsSliceState {
  alertConflict: boolean;
  alertDeleteTimetable: boolean;
  alertTimetableExists: boolean;
  alertChangeSemester: boolean;
  alertNewTimetable: boolean;
  alertEnableNotifications: boolean;
  alertFacebookFriends: boolean;
  facebookAlertIsOn: boolean;
  mostFriendsClassId: null | number;
  mostFriendsCount: number;
  totalFriendsCount: number;
  desiredSemester: number;
  timetableToDelete: null | Timetable;
}

const initialState: AlertsSliceState = {
  alertConflict: false,
  alertDeleteTimetable: false,
  alertTimetableExists: false,
  alertChangeSemester: false,
  alertNewTimetable: false,
  alertEnableNotifications: false,
  alertFacebookFriends: false,
  facebookAlertIsOn: false,
  mostFriendsClassId: null,
  mostFriendsCount: 0,
  totalFriendsCount: 0,
  desiredSemester: 0,
  timetableToDelete: null,
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
    // bring up pop up to ask to enable notifications
    alertEnableNotifications: (state) => {
      state.alertEnableNotifications = true;
    },
    dismissEnableNotifications: (state) => {
      state.alertEnableNotifications = false;
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
    alertFacebookFriends: (state) => {
      state.alertFacebookFriends = true;
    },
    showFacebookAlert: (state) => {
      state.facebookAlertIsOn = true;
    },
    dismissFacebookFriends: (state) => {
      state.alertFacebookFriends = false;
      state.facebookAlertIsOn = false;
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
