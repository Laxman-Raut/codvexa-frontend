import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",

  initialState: {
    userdata: null,
  },

  reducers: {
    setUserData: (state, action) => {
      state.userdata = action.payload;
    },
  },
});

export const { setUserData } = userSlice.actions;

export default userSlice.reducer;