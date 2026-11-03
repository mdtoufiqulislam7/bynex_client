import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

// Base query with auth token
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  },
});

// Base query with re-auth logic
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401 && typeof window !== 'undefined') {
    // Token expired, try to refresh
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      // Try to get a new token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh-tokens',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new token
        const data: any = refreshResult.data;
        if (data.data?.attributes?.tokens) {
          localStorage.setItem('accessToken', data.data.attributes.tokens.access.token);
          localStorage.setItem('refreshToken', data.data.attributes.tokens.refresh.token);

          // Retry the original query
          result = await baseQuery(args, api, extraOptions);
        }
      } else {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      // No refresh token, logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'User',
    'Wallet',
    'Transactions',
    'InvestmentPlans',
    'Investments',
    'Referrals',
    'Tickets',
    'Notifications',
    'Profits',
    'PaymentGateways',
    'SavedAccounts',
    'Ranks',
    'Community',
  ],
  endpoints: () => ({}),
});
