// src/features/counter/counterSlice.js
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    noData: true,
    wallet: null,
    refresh: null,
    settings: {},
    statistic: null
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.user = action.payload;
      state.noData = false;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    setWallet: (state, action) => {
      state.wallet = action.payload;
    },
    refreshUser: (state, action) => {
      state.refresh = action.payload;
    },
    logOutUser: (state) => {
      state.user = null;
      state.noData = true;
      Cookies.remove("accessToken");
      window.location.href = "/login";
    },
    setStatistic: (state, action) => {
      state.statistic = action.payload;
    }
  },
});

export const { setCurrentUser, logOutUser, setWallet, refreshUser, setSettings, setStatistic } = userSlice.actions;

export default userSlice.reducer;