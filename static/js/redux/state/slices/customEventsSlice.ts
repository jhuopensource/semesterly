import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addNewCustomEvent,
  changeActiveSavedTimetable,
  removeCustomEvent,
  updateExistingEvent,
} from "../../actions";
import { Event, Timetable } from "../../constants/commonTypes";

interface CustomEventsSlice {
  events: Event[];
}

const initialState: CustomEventsSlice = { events: [] };

const customEventsSlice = createSlice({
  name: "customEevnts",
  initialState,
  reducers: {
    clearCustomEvents: (state) => {
      state.events = [];
    },
    clearConflictingEvents: (state) => {
      const clearedEvents = state.events.filter(
        // @ts-ignore
        (event) =>
          event.exists_conflict === undefined || event.exists_conflict === false
      );
      state.events = clearedEvents;
    },
    receiveCustomEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addNewCustomEvent, (state, action: PayloadAction<Event>) => {
        state.events.push(action.payload);
      })
      .addCase(updateExistingEvent, (state, action: PayloadAction<Event>) => {
        const tEventIndex = state.events.findIndex((s) => s.id === action.payload.id);
        if (tEventIndex !== -1) {
          const updatedEvent = Object.assign(
            {},
            state.events[tEventIndex],
            action.payload
          );
          state.events[tEventIndex] = updatedEvent;
        }
      })
      .addCase(removeCustomEvent, (state, action: PayloadAction<number>) => {
        const newState = state.events.filter((event) => event.id !== action.payload);
        state.events = newState;
      })
      .addCase(
        changeActiveSavedTimetable,
        (
          state,
          action: PayloadAction<{
            timetable: Timetable;
            upToDate: boolean;
          }>
        ) => {
          state.events = action.payload.timetable.events;
        }
      );
  },
});

export const customEventsAction = customEventsSlice.actions;

export default customEventsSlice.reducer;
