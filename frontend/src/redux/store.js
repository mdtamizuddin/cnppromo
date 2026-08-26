// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";

const store = configureStore({
  reducer: rootReducer,
  // Add middleware, devtools, etc. as needed
});

export default store;