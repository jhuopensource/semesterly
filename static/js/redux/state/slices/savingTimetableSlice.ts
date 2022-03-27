import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit";
import {
  alertTimeTableExists,
  changeActiveSavedTimetable,
  changeActiveTimetable,
} from "../../actions/initActions";
import { Timetable } from "../../constants/commonTypes";

interface SavingTimetableSliceState {
  activeTimetable: Timetable;
  saving: boolean;
  upToDate: boolean;
}

const initialState: SavingTimetableSliceState = {
  activeTimetable: {
    name: "Untitled Schedule",
    id: null,
    slots: [],
    has_conflict: null,
    show_weekend: null,
    avg_rating: null,
    events: [],
  },
  saving: false, // true if we are currently waiting for a response from the backend
  upToDate: false,
};

const savingTimetableSlice = createSlice({
  name: "savingTimetable",
  initialState,
  reducers: {
    requestSaveTimetable: (state) => {
      state.saving = !state.upToDate;
    },
    changeActiveSavedTimetableName: (state, action: PayloadAction<string>) => {
      state.activeTimetable.name = action.payload;
      state.upToDate = false;
    },
    setUpToDate: (state, action: PayloadAction<boolean>) => {
      state.upToDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        changeActiveSavedTimetable,
        (
          state,
          action: PayloadAction<{
            timetable: Timetable;
            upToDate: boolean;
          }>
        ) => {
          state.activeTimetable = action.payload.timetable;
          state.saving = false;
          state.upToDate = action.payload.upToDate;
        }
      )
      .addCase(alertTimeTableExists, (state) => {
        state.saving = false;
      })
      .addCase(changeActiveTimetable, (state) => {
        state.upToDate = false;
      });
  },
});

export const savingTimetableActions = savingTimetableSlice.actions;

export default savingTimetableSlice.reducer;
