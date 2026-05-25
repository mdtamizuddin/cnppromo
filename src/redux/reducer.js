// src/app/reducers.js
import { combineReducers } from "redux";
import userSlice from "./features/user/userSlice";

const rootReducer = combineReducers({
  user: userSlice,
  // Add other reducers here
});

export default rootReducer;