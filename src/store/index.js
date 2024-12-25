import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './apis/authApi';

const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export { useLoginMutation, useSignupMutation } from "./apis/authApi";
export { store };  