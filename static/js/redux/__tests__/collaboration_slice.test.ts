import collaborationReducer, {
  collaborationActions,
} from "../state/slices/collaborationSlice";

describe("collaborationSlice", () => {
  test("startSession initializes collaboration metadata", () => {
    const state = collaborationReducer(
      undefined,
      collaborationActions.startSession({
        slug: "abc123",
        revision: 7,
        permission: "edit",
        role: "editor",
        editToken: "editor-token",
        updatedAt: "2026-04-22T12:00:00Z",
      })
    );
    expect(state.active).toBe(true);
    expect(state.slug).toBe("abc123");
    expect(state.revision).toBe(7);
    expect(state.permission).toBe("edit");
    expect(state.role).toBe("editor");
  });

  test("applyServerSnapshot clears pending state and advances revision", () => {
    const startingState = collaborationReducer(
      undefined,
      collaborationActions.startSession({
        slug: "abc123",
        revision: 1,
        permission: "edit",
        role: "editor",
        editToken: "editor-token",
        updatedAt: null,
      })
    );
    const withPending = collaborationReducer(
      startingState,
      collaborationActions.queueOperation({
        type: "replace_timetable",
        payload: {
          timetable: {
            id: 1,
            slots: [],
            has_conflict: false,
            show_weekend: false,
            name: "Shared",
            avg_rating: 0,
            events: [],
          },
        },
      })
    );
    const state = collaborationReducer(
      withPending,
      collaborationActions.applyServerSnapshot({
        revision: 2,
        updatedAt: "2026-04-22T13:00:00Z",
      })
    );
    expect(state.revision).toBe(2);
    expect(state.pendingOps).toHaveLength(0);
    expect(state.staleConflict).toBe(false);
  });

  test("stopSession resets to initial state", () => {
    const started = collaborationReducer(
      undefined,
      collaborationActions.startSession({
        slug: "abc123",
        revision: 1,
        permission: "view",
        role: "viewer",
        editToken: null,
        updatedAt: null,
      })
    );
    const stopped = collaborationReducer(started, collaborationActions.stopSession());
    expect(stopped.active).toBe(false);
    expect(stopped.slug).toBeNull();
    expect(stopped.revision).toBe(0);
  });
});
