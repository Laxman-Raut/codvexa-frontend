import { createSlice } from "@reduxjs/toolkit";

const projectslice = createSlice({
  name: "project",

  initialState: {
    projects: [],
    starredprojects: [],
    currentproject:null
  },

  reducers: {
    setprojects: (state, action) => {
      state.projects = action.payload;
    },
     setcurrentproject: (state, action) => {
      state.currentproject= action.payload;
    },

    setstarredprojects: (state, action) => {
      state.starredprojects = action.payload;
    },

    addNewproject: (state, action) => {
      state.projects.unshift(action.payload);
    },

    starproject: (state, action) => {
      const project = state.projects.find(
        (p) => p._id == action.payload._id
      );

      if (project) {
        project.starred = action.payload.starred;
      }
    },

    removeProject: (state, action) => {
      state.projects = state.projects.filter(
        (p) => p._id != action.payload
      );
    },
  },
});

export const {
  setprojects,
  setstarredprojects,
  addNewproject,
  starproject,
  removeProject,
  setcurrentproject,
} = projectslice.actions;

export default projectslice.reducer;