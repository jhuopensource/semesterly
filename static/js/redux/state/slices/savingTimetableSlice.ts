import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { addNewCustomEvent, changeActiveSavedTimetable, changeActiveTimetable, removeCustomEvent, updateExistingEvent } from '../../actions';
import { Timetable } from '../../constants/commonTypes';

interface SavingTimetableSliceState {
  activeTimetable: Timetable;
  saving: boolean;
  upToDate: boolean;
}

const initialState: SavingTimetableSliceState = {
  activeTimetable: {
    name: 'Untitled Schedule',
    id: null,
    slots: [],
    has_conflict: null,
    avg_rating: null,
    events: [],
  },
  saving: false, // true if we are currently waiting for a response from the backend
  upToDate: false,
};

const savingTimetableSlice = createSlice({
  name: 'savingTimetable',
  initialState,
  reducers: {
    requestSaveTimetable: (state) => {
      state.saving = !state.upToDate;
    },
    alertTimetableExists: (state) => {
      state.saving = false;
    },
    changeActiveSavedTimetableName: (state, action: PayloadAction<string>) => {
      state.activeTimetable.name = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeActiveSavedTimetable, (state, action: PayloadAction<{
        timetable: Timetable,
        upToDate: boolean
      }>) => {
        state.activeTimetable = action.payload.timetable;
        state.saving = false;
        state.upToDate = action.payload.upToDate;
      })
      .addMatcher(isAnyOf(
        addNewCustomEvent,
        changeActiveTimetable,
        removeCustomEvent,
        updateExistingEvent,
      ), (state) => {
        state.upToDate = false;
      });
  },
});

export const savingTimetableActions = savingTimetableSlice.actions;

export default savingTimetableSlice.reducer;
