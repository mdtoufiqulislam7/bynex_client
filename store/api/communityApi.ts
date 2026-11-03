import { baseApi } from './baseApi';

export interface CommunityPostAuthor {
  id?: string | null;
  name: string;
  avatar?: string;
  country: string;
  countryCode?: string;
  countryFlag?: string;
}

export interface CommunityPost {
  id: string;
  isSeed: boolean;
  author: CommunityPostAuthor;
  content: string;
  image?: string | null;
  tags: string[];
  likesCount: number;
  reactionsCount: number;
  reactions: {
    like: number;
    love: number;
    fire: number;
    rocket: number;
    clap: number;
  };
  createdAt: string;
  minutesAgo?: number;
  hasLiked?: boolean;
  userReaction?: string | null;
}

export interface GetCommunityPostsParams {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}

export interface CreatePostRequest {
  content: string;
  image?: string;
  tags?: string[];
  country?: string;
  countryCode?: string;
  countryFlag?: string;
}

export interface ReactPostRequest {
  postId: string;
  type: 'like' | 'love' | 'fire' | 'rocket' | 'clap';
}

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunityPosts: builder.query<any, GetCommunityPostsParams | void>({
      query: (params) => ({
        url: '/community',
        params: params || {},
      }),
      providesTags: ['Community'],
    }),

    createCommunityPost: builder.mutation<any, CreatePostRequest>({
      query: (body) => ({
        url: '/community',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Community'],
    }),

    reactToPost: builder.mutation<any, ReactPostRequest>({
      query: ({ postId, type }) => ({
        url: `/community/${postId}/react`,
        method: 'POST',
        body: { type },
      }),
      invalidatesTags: ['Community'],
    }),
  }),
});

export const {
  useGetCommunityPostsQuery,
  useCreateCommunityPostMutation,
  useReactToPostMutation,
} = communityApi;

