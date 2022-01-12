import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { alertConflict, receiveCourses, receiveTimetables, updateSemester, changeActiveTimetable } from '../../actions/initActions';
import { Course, Offering, Section, Timetable } from '../../constants/commonTypes';
import { saveLocalActiveIndex } from '../../util';

interface TimetablesSliceState{
  isFetching: boolean;
  items: Timetable[];
  hovered: {
    course: Course;
    section: Section
    offerings: Offering[];
    is_optional: boolean;
    is_locked: boolean;
  }| null;
  active: number;
  loadingCachedTT: boolean;
  lastSlotAdded: number | Object | null;
  // either int (course id), object (custom slots state), or null
}

const emptyTimetable: Timetable = {
  slots: [],
  has_conflict: false,
  id: null,
  avg_rating: 0,
  events: [],
  name: '',
};

const initialState: TimetablesSliceState = {
  isFetching: false,
  items: [
    emptyTimetable,
  ],
  hovered: null,
  active: 0,
  loadingCachedTT: true,
  lastSlotAdded: null, // either int (course id), object (custom slots state), or null
};

const timetablesSlice = createSlice({
  name: 'timetables',
  initialState,
  reducers: {
    loadingCachedTimetable: (state) => {
      state.loadingCachedTT = true;
    },
    cachedTimetableLoaded: (state) => {
      state.loadingCachedTT = false;
    },
    requestTimetables: (state) => {
      state.isFetching = true;
    },
    hoverSection: (state, action: PayloadAction<{
      course: Course,
      section: Section
    }>) => {
      state.hovered = {
        course: action.payload.course,
        section: action.payload.section,
        offerings: action.payload.section.offering_set,
        is_locked: true,
        is_optional: false,
      };
    },
    unhoverSection: (state) => {
      state.hovered = null;
    },
    updateLastCourseAdded: (state, action:PayloadAction<number | Object | null>) => {
      state.lastSlotAdded = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateSemester, (state) => {
        state.isFetching = false;
      })
      .addCase(receiveCourses, (state) => {
        state.isFetching = false;
      })
      .addCase(receiveTimetables, (state, action: PayloadAction<Timetable[]>) => {
        // if the array of timetables is empty, set state.items to an array with one empty timetable
        const actionTimetables = action.payload.length > 0 ? action.payload : [emptyTimetable];
        state.isFetching = false;
        state.hovered = null;
        state.active = 0;
        state.items = actionTimetables;
      })
      .addCase(changeActiveTimetable, (state, action) => {
        saveLocalActiveIndex(action.payload);
        state.active = action.payload;
      })
      .addCase(alertConflict, (state) => {
        state.isFetching = false;
      });
  },
});
export const getTimetables = (state: TimetablesSliceState) => state.items;

export const getActiveTimetable = (state: TimetablesSliceState) => state.items[state.active];

export const getHoveredSlots = (state: TimetablesSliceState) => state.hovered;

export const timetablesActions = timetablesSlice.actions;
export default timetablesSlice.reducer;
