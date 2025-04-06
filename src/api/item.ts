import api from '@/lib/api';
import { removeEmptyParams } from '@/utils/utils';

export interface ItemFieldValue {
  fieldId: number;
  fieldName: string;
  displayName: string;
  fieldType: string;
  value: any;
}

export interface Item {
  id: number;
  title: string;
  slug: string;
  templateId: number;
  templateName: string;
  createdBy: number;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  avgRating: number;
  ratingsCount: number;
  viewsCount: number;
  fieldValues?: ItemFieldValue[];
}

export interface ItemsResponse {
  list: Item[];
  pageNo: number;
  pageSize: number;
  total: number;
}

export interface UserRating {
  id: number;
  itemId: number;
  userId: number;
  username: string;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingsResponse {
  list: UserRating[];
  pageNo: number;
  pageSize: number;
  total: number;
}

export interface ItemsQueryParams {
  title?: string;
  templateId?: number;
  createdTimeStart?: string;
  createdTimeEnd?: string;
  pageNo?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getItems = (params: ItemsQueryParams = {}): Promise<ItemsResponse> => {
  const searchParams = removeEmptyParams(params);
  return api.get('v1/items', {
    searchParams,
  }).json();
};

export const getItemById = (id: number): Promise<Item> =>
  api.get(`v1/items/${id}`).json();

export const getItemRatings = (
  itemId: number,
  params: { pageNo?: number; pageSize?: number } = {}
): Promise<RatingsResponse> =>
  api.get(`v1/items/${itemId}/ratings`, {
    searchParams: params as any,
  }).json();

export const deleteItem = (id: number): Promise<{ status: string; message: string }> =>
  api.delete(`v1/items/${id}`).json();