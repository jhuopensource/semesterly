import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeActiveSavedTimetable } from "../../actions/initActions";
import { Event, Timetable } from "../../constants/commonTypes";

export interface CustomEventsSlice {
  events: Event[];
  isModalVisible: boolean;
  selectedEventId: number | null;
}

const initialState: CustomEventsSlice = {
  events: [],
  isModalVisible: false,
  selectedEventId: null,
};

const customEventsSlice = createSlice({
  name: "customEvents",
  initialState,
  reducers: {
    clearCustomEvents: (state) => {
      state.events = [];
    },
    receiveCustomEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    addNewCustomEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
    },
    replacePreviewEvent: (
      state,
      action: PayloadAction<{ oldId: number; newId: number }>
    ) => {
      const { oldId, newId } = action.payload;
      const index = state.events.findIndex((event) => event.id === oldId);
      state.events[index] = { ...state.events[index], id: newId, preview: false };
    },
    deletePreviewEvent: (state, action: PayloadAction<number>) => {
      state.events = state.events.filter((event) => event.id !== action.payload);
    },
    updateExistingEvent: (state, action: PayloadAction<Event>) => {
      const tEventIndex = state.events.findIndex((s) => s.id === action.payload.id);
      if (tEventIndex !== -1) {
        const updatedEvent = Object.assign(
          {},
          state.events[tEventIndex],
          action.payload
        );
        state.events[tEventIndex] = updatedEvent;
      }
    },
    removeCustomEvent: (state, action: PayloadAction<number>) => {
      const newState = state.events.filter((event) => event.id !== action.payload);
      state.events = newState;
    },
    showCustomEventsModal: (state, action: PayloadAction<number>) => {
      state.selectedEventId = action.payload;
      state.isModalVisible = true;
    },
    hideCustomEventsModal: (state) => {
      state.isModalVisible = false;
      state.selectedEventId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
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

export const customEventsActions = customEventsSlice.actions;

export default customEventsSlice.reducer;
