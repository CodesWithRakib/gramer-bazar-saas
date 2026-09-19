import { api } from '../../store/api';
import { Product } from '../catalog/catalogApi';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export const wishlistsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserWishlist: builder.query<WishlistItem[], void>({
      query: () => '/wishlists',
      providesTags: ['Wishlist'],
    }),
    addProductToWishlist: builder.mutation<{ success: boolean, message: string }, string>({
      query: (productId) => ({
        url: `/wishlists/${productId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeProductFromWishlist: builder.mutation<{ success: boolean, message: string }, string>({
      query: (productId) => ({
        url: `/wishlists/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetUserWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} = wishlistsApi;
