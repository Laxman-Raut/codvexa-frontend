import { createSlice } from "@reduxjs/toolkit";

const projectslice = createSlice({
  name: "project",

  initialState: {
    projects: [],
    starredprojects: [],
  },

  reducers: {
    setprojects: (state, action) => {
      state.projects = action.payload;
    },

    addNewproject: (state, action) => {
      state.projects.unshift(action.payload);
    },

    setstarredprojects: (state, action) => {
      state.starredprojects = action.payload;
    },
  },
});

export const {
  setprojects,
  addNewproject,
  setstarredprojects,
} = projectslice.actions;

export default projectslice.reducer;