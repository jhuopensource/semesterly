import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initAllState, receiveSchoolInfo } from "../../actions/initActions";

interface SchoolSliceState {
  school: string;
  areas: string[];
  departments: string[];
  levels: string[];
  subSchools: string[];
  dataLastUpdated: string;
}

const initialState: SchoolSliceState = {
  school: "",
  areas: [],
  departments: [],
  levels: [],
  subSchools: [],
  dataLastUpdated: "",
};

const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initAllState, (state, action: PayloadAction<any>) => {
        state.school = action.payload.school;
      })
      .addCase(receiveSchoolInfo, (state, action: PayloadAction<any>) => {
        const {
          areas,
          departments,
          levels,
          subSchools,
          last_updated: dataLastUpdated,
        } = action.payload;
        return { school: state.school, areas, departments, levels, subSchools, dataLastUpdated };
      });
  },
});

export default schoolSlice.reducer;
