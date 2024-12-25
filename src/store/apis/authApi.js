import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8080',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/user/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation({
      query: (userData) => ({
        url: '/user/signup',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useSignupMutation 
} = authApi; 
export { authApi };