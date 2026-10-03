import { createSlice } from "@reduxjs/toolkit";

const projectslice = createSlice({
  name: "project",

  initialState: {
    projects: [],
   
  },

  reducers: {
    setprojects: (state, action) => {
      state.projects = action.payload;
    },

    addNewproject: (state, action) => {
      state.projects.unshift(action.payload);
    },


  },
});

export const {
  setprojects,
  addNewproject,
  setstarredprojects,
  updateProject,
  removeProject,
} = projectslice.actions;

export default projectslice.reducer;