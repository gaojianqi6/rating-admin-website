import api from "@/lib/api";
import { Role, User, UserList, UserListRequest } from "@/typings/user";

export interface UserRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

export type UpdateUserRequest = Partial<UserRequest>;

export const getUser = (): Promise<User> => api.get("v1/users/me").json();

export const getRoles = (): Promise<Role[]> => api.get("v1/users/roles").json();

export const getUsers = (params?: Partial<UserListRequest>): Promise<UserList> => 
  api.get("v1/users", { searchParams: params as Record<string, string> }).json();

export const createUser = (data: UserRequest): Promise<User> =>
  api.post("v1/users", { json: data }).json();

export const updateUser = (id: number, data: UpdateUserRequest): Promise<User> =>
  api.put(`v1/users/${id}`, { json: data }).json();

export const deleteUser = (id: number): Promise<void> =>
  api.delete(`v1/users/${id}`).json();