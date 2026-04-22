import ghostTimetableReducer, {
  ghostTimetableActions,
} from "../state/slices/ghostTimetableSlice";

describe("ghostTimetableSlice", () => {
  it("loads and clears ghost overlay state", () => {
    let state = ghostTimetableReducer(undefined, { type: "unknown" });
    state = ghostTimetableReducer(
      state,
      ghostTimetableActions.startGhostLoad("abc123")
    );
    expect(state.enabled).toBe(true);
    expect(state.shareSlug).toBe("abc123");
    expect(state.isLoading).toBe(true);

    state = ghostTimetableReducer(
      state,
      ghostTimetableActions.receiveGhostTimetable({
        slug: "abc123",
        permission: "view",
        updatedAt: "2026-01-01T00:00:00Z",
        timetable: {
          id: null,
          slots: [],
          has_conflict: false,
          show_weekend: false,
          name: "Shared",
          avg_rating: 0,
          events: [],
        },
      })
    );
    expect(state.isLoading).toBe(false);
    expect(state.timetable?.name).toBe("Shared");

    state = ghostTimetableReducer(state, ghostTimetableActions.clearGhostOverlay());
    expect(state.enabled).toBe(false);
    expect(state.timetable).toBeNull();
  });
});
