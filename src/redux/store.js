import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userslice";
import projectReducer from "./projectslice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    project: projectReducer,
  },
});