import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../index";
import { Timetable } from "../../constants/commonTypes";

interface GhostTimetableSliceState {
  enabled: boolean;
  shareSlug: string | null;
  timetable: Timetable | null;
  permission: "view" | "edit";
  isLoading: boolean;
  websocketConnected: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

const initialState: GhostTimetableSliceState = {
  enabled: false,
  shareSlug: null,
  timetable: null,
  permission: "view",
  isLoading: false,
  websocketConnected: false,
  lastSyncedAt: null,
  error: null,
};

const ghostTimetableSlice = createSlice({
  name: "ghostTimetable",
  initialState,
  reducers: {
    startGhostLoad: (state, action: PayloadAction<string>) => {
      state.enabled = true;
      state.shareSlug = action.payload;
      state.isLoading = true;
      state.error = null;
    },
    receiveGhostTimetable: (
      state,
      action: PayloadAction<{
        slug: string;
        timetable: Timetable;
        permission: "view" | "edit";
        updatedAt: string | null;
      }>
    ) => {
      state.enabled = true;
      state.shareSlug = action.payload.slug;
      state.timetable = action.payload.timetable;
      state.permission = action.payload.permission;
      state.lastSyncedAt = action.payload.updatedAt;
      state.isLoading = false;
      state.error = null;
    },
    setGhostWebsocketConnected: (state, action: PayloadAction<boolean>) => {
      state.websocketConnected = action.payload;
    },
    setGhostError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearGhostOverlay: () => initialState,
  },
});

export const selectGhostTimetable = (state: RootState) => state.ghostTimetable;
export const ghostTimetableActions = ghostTimetableSlice.actions;
export default ghostTimetableSlice.reducer;
