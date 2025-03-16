import api from "@/lib/api";
import { Role, User, UserList, UserListRequest } from "@/typings/user";

export const getUser = (): Promise<User> => api.get("v1/users/me").json();

export const getRoles = (): Promise<Role[]> => api.get("v1/users/roles").json();

export const getUsers = (params: UserListRequest): Promise<UserList> => api.get("v1/users", { searchParams: params}).json();