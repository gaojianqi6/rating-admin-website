import api from "@/lib/api";
import { Role, User, UserListRequest } from "@/typings/user";

export const getUser = (): Promise<User> => api.get("v1/users/me").json();

export const getRoles = (): Promise<Role[]> => api.get("v1/users/roles").json();

export const getUsers = (params: UserListRequest): Promise<Role[]> => api.get("v1/users", { searchParams: params}).json();