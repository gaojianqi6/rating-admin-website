import { ListRequest } from "@/typings/common";

export interface User {
  id: number
  username: string
  email: string
  roleId: number
  roleName: string
  password: string
  updatedTime: string
  createdTime: string
  updatedBy: number
  updatedByName: string
  avatar: string
}

export interface Role {
  id: number
  name: string
}

export interface UserListRequest extends ListRequest {
  username: string
}

export interface UserList {
  list: User[]
  pageNo: number
  pageSize: number
  total: number
}