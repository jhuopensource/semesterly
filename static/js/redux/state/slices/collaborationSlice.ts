import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../index";
import { Timetable } from "../../constants/commonTypes";

interface CollaborationPeer {
  id: string;
  name: string;
  role: "viewer" | "editor";
}

interface CollaborationOperation {
  type: "replace_timetable";
  payload: {
    timetable: Timetable;
  };
}

interface CollaborationSliceState {
  active: boolean;
  slug: string | null;
  role: "viewer" | "editor";
  permission: "view" | "edit";
  editToken: string | null;
  revision: number;
  websocketConnected: boolean;
  peers: CollaborationPeer[];
  pendingOps: CollaborationOperation[];
  lastSyncedAt: string | null;
  error: string | null;
  staleConflict: boolean;
}

const initialState: CollaborationSliceState = {
  active: false,
  slug: null,
  role: "viewer",
  permission: "view",
  editToken: null,
  revision: 0,
  websocketConnected: false,
  peers: [],
  pendingOps: [],
  lastSyncedAt: null,
  error: null,
  staleConflict: false,
};

const collaborationSlice = createSlice({
  name: "collaboration",
  initialState,
  reducers: {
    startSession: (
      state,
      action: PayloadAction<{
        slug: string;
        revision: number;
        permission: "view" | "edit";
        role: "viewer" | "editor";
        editToken: string | null;
        updatedAt: string | null;
      }>
    ) => {
      state.active = true;
      state.slug = action.payload.slug;
      state.revision = action.payload.revision;
      state.permission = action.payload.permission;
      state.role = action.payload.role;
      state.editToken = action.payload.editToken;
      state.lastSyncedAt = action.payload.updatedAt;
      state.error = null;
      state.staleConflict = false;
    },
    stopSession: () => initialState,
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.websocketConnected = action.payload;
    },
    receivePresence: (state, action: PayloadAction<CollaborationPeer[]>) => {
      state.peers = action.payload;
    },
    queueOperation: (state, action: PayloadAction<CollaborationOperation>) => {
      state.pendingOps.push(action.payload);
    },
    clearOperations: (state) => {
      state.pendingOps = [];
    },
    applyServerSnapshot: (
      state,
      action: PayloadAction<{ revision: number; updatedAt: string | null }>
    ) => {
      state.revision = action.payload.revision;
      state.lastSyncedAt = action.payload.updatedAt;
      state.staleConflict = false;
      state.error = null;
      state.pendingOps = [];
    },
    setSessionError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setStaleConflict: (state, action: PayloadAction<boolean>) => {
      state.staleConflict = action.payload;
    },
  },
});

export const selectCollaboration = (state: RootState) => state.collaboration;

export const collaborationActions = collaborationSlice.actions;
export default collaborationSlice.reducer;
